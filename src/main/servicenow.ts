import { app, BrowserWindow, session } from 'electron';
import { net } from 'electron';

export async function getServiceNowToken() {
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
        event.preventDefault();
        callback(true); // 忽略证书错误
    });
    const win = new BrowserWindow({ show: true });
    win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }));
    win.webContents.on('will-navigate', (event, url) => {
        // 允许所有导航
    });
    try {
        await win.loadURL('https://pfetst.service-now.com/now/sow/home');
    } catch (err) {
        console.log(err)
    }

    win.webContents.on('did-navigate', async (event, url) => {
        console.log("🚀 ~ getServiceNowToken ~ url:", url)
        if (url.startsWith('https://pfetst.service-now.com/now/sow/home')) {
            // 登录完成，开始请求 token
            // 等待用户手动完成 SSO 登录
            // 你可以监听某个 URL 或 DOM 变化判断登录完成

            // 获取 Cookie
            // const cookies = await win.webContents.session.cookies.get({ session: true })
            // const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

            // 用 net.request 请求 token 接口
            const request = net.request({
                method: 'GET', // 或 POST，视 API 而定
                url: 'https://pfetst.service-now.com/api/now/v2/table/oauth_token', // 替换为实际 token 接口
                // url: 'https://pfetst.service-now.com/oauth_token.do', // 替换为实际 token 接口

                // headers: { Cookie: cookieHeader },
                session: win.webContents.session,
                useSessionCookies: true,
                redirect: 'follow',
                credentials: 'include'
            });

            request.on('response', (response) => {
                let body = '';
                response.on('data', (chunk) => { body += chunk; });
                response.on('end', () => {
                    console.log('Token response:', body);
                    // 解析 body 获取 token
                });
            });

            request.end();
        }
    });
    win.webContents.on('did-finish-load', async () => {

        console.log('did-finish-load');


    });

}