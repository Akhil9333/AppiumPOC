import {
  calculateVitalityStatus,
  captureLoginEvents,
  createPartyCore,
  deleteUserInstruction,
  enrolUser,
  getUserInstruction,
  loginUser,
  printUserDetails,
  processEvents,
  processEventToCreateReward,
  registerUser
} from '../../../src/config/API-to-Create-New-User.js';
import { requiredSetting } from '../../../src/config/mobileSessionInit.js';
import { requiredUserCreationSetting, userCreationSetting } from '../../../src/config/userCreation.js';

let member: string | undefined;

export const testAccounts = {
  get member(): string {
    if (!member) {
      throw new Error('The member account has not been provisioned. Run initializeTestAccounts before accessing it.');
    }
    return member;
  }
};

export async function initializeTestAccounts(): Promise<void> {
  member = undefined;
  const environment = (userCreationSetting('VG_ENVIRONMENT') ?? 'mdev').toLowerCase();
  if (!['mdev', 'ca-test', 'ca-dev'].includes(environment)) {
    throw new Error('VG_ENVIRONMENT must be one of: mdev, ca-test, ca-dev.');
  }
  const prefix = `VG_${environment.toUpperCase().replace('-', '_')}_`;
  const loginPrefix = requiredUserCreationSetting(`${prefix}LOGIN_PREFIX`);
  requiredSetting('APP_PASSWORD');
  for (const key of ['ZUUL_URL', 'TENANT_NUMBER', 'INTEGRATION_PLATFORM_BASE_URL', 'EMAIL_DOMAIN']) {
    requiredUserCreationSetting(`${prefix}${key}`);
  }
  requiredUserCreationSetting('configUserAgent');
  for (const key of ['API_BASIC_AUTH', 'API_BEARER_TOKEN']) {
    const value = requiredUserCreationSetting(`${prefix}${key}`).replace(/^(Basic|Bearer)\s+/i, '');
    if (!value || value === '******') {
      throw new Error(`Provide a valid ${prefix}${key} before provisioning the member account.`);
    }
  }
  const carrierPartyId = await createPartyCore();
  const user = await enrolUser(carrierPartyId);
  await registerUser(user);
  await calculateVitalityStatus(user.vitalityMembershipId);
  //await loginUser(user.userName);
  const instructions = await getUserInstruction(user.userName);
  await captureLoginEvents(user.partyId, instructions.LOGIN_T_AND_C_ID);
  await processEventToCreateReward(user.partyId);
  await processEvents(user.partyId);
  await deleteUserInstruction(user.userName, instructions);
  printUserDetails(user);
  member = `${loginPrefix}${user.userName}`;
  console.log(`Member username: ${member}`);
}