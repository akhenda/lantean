import { clerkClient, currentUser as clientCurrentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/server';
import { currentUser as serverCurrentUser } from '@clerk/nextjs/server';

import { createProjectLogger } from '<%= loggingLibImportPath %>';

import { AuthProvider } from './provider';
import { Role } from './schema/types';

const Logger = createProjectLogger('<%= importPath %>', 'debug');

const client = {
  AuthProvider,

  /**
   * Get the currently logged in user in the browser
   */
  async authUser() {
    const user = await clientCurrentUser();

    return user;
  },
};

const server = {
  /**
   * Get the currently logged in user on the server
   */
  async authUser() {
    const user = await serverCurrentUser();

    return user;
  },

  /**
   * Create an invitation using Clerk and send it to a user via email
   *
   * @param this - since we use this function in classes, we annotate this with void
   * @param emailAddress - where to send the invite
   * @param role - the role to be assigned to the invitee
   * @returns the invitation object
   */
  async inviteUser(this: void, emailAddress: string, role: Role) {
    Logger.debug('Inviting Clerk user', { emailAddress });

    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress,
      publicMetadata: { role, throughInvitation: true },
      redirectUrl: process.env.NEXT_PUBLIC_URL,
    });

    Logger.debug('Clerk user invited', { invitation });

    return invitation;
  },

  /**
   * Update the Clerk user role that is stored in the private metadata
   *
   * @param this - since we use this function in classes, we annotate this with void
   * @param userId - the user id of the user we need to update role for
   * @param role - the new role
   */
  async updateUserRole(this: void, userId: string, role: Role | null = 'SUBACCOUNT_USER') {
    Logger.debug('Updating Clerk user role', { role, userId });
    await clerkClient.users.updateUserMetadata(userId, { privateMetadata: { role } });
    Logger.debug('Clerk user role updated');
  },

  /**
   * Get a Clerk user and perform an action using the user
   *
   * @param this - since we use this function in classes, we annotate this with void
   * @param next - the callback function to run with the found Clerk user
   * @param onDoesNotExist - the callback function to run when no Clerk user is found
   * @returns the result of the success/next callback
   */
  async withClerkUser<Result, OnDoesNotExist = undefined>(
    this: void,
    next: (user: User) => Promise<Result>,
    onDoesNotExist?: () => OnDoesNotExist,
  ) {
    Logger.info('Starting With Clerk user...');
    // Logger.info('Starting With Clerk user...');
    // Logger.fatal('Starting With Clerk user...');
    // Logger.error(new Error('Test test!'), 'Starting With Clerk user...');
    // Logger.warn('Starting With Clerk user...');

    const user = await serverCurrentUser();

    if (!user) {
      Logger.warn('Clerk user not found! Running onDoesNotExist callback');

      return onDoesNotExist ? onDoesNotExist() : undefined;
    }

    Logger.info('Clerk user', { user });

    const result = await next(user);

    Logger.info('With Clerk user result', { result });

    return result;
  },
};

export const auth = { client, server };