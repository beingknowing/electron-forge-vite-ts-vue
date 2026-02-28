import * as os from 'os';
export function getUserName() {
    const username = process.env.USERNAME || os.userInfo().username;
    return username;
} 