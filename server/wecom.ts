import { GET, POST } from "./httpReq";
import { getWecomSettings } from "./miniapp";
import prisma from "../db/client";

const API: string = " https://qyapi.weixin.qq.com/cgi-bin";

const corpCache: {
  [key: string]: { access_token?: { token: string; expiry: number } };
} = {
  // [corpId]: {},
};

async function getAccessToken(
  corpId: string,
  corpSecret: string,
  forceRefresh?: boolean
) {
  const cacheValue = corpCache[corpId] || {};

  if (
    !forceRefresh &&
    cacheValue?.access_token?.expiry &&
    cacheValue?.access_token?.expiry > new Date().getTime()
  ) {
    console.log("return cached token for ", corpId);
    if (cacheValue?.access_token?.expiry - new Date().getTime() < 60000) {
      getAccessToken(corpId, corpSecret, true);
    }
    return cacheValue.access_token;
  }

  const result = await GET(
    API + `/gettoken?corpId=${corpId}&corpSecret=${corpSecret}`
  );

  if (result.errcode === 0) {
    console.log("got wecom token for ", corpId);
    const access_token = {
      token: result.access_token,
      expiry: new Date().getTime() + result.expires_in * 1000,
    };
    corpCache[corpId] = {
      ...corpCache[corpId],
      access_token,
    };
    console.log("corp cache", corpCache);
    return { ...access_token };
  } else {
    return null;
  }
}

const getSettingsByCompany = async (companyId: number) => {
  const wecomSettings = await getWecomSettings(companyId);

  if (!wecomSettings) {
    const message =
      "get wecom settings is undefined for user company: " + companyId;
    console.error(message);
    throw Error(message);
  }

  const miniappId = wecomSettings?.appId;
  const corpId = wecomSettings?.corpId || "undefined";
  const corpSecret = wecomSettings?.corpSecret || "undefined";
  const coverUrl = wecomSettings?.coverUrl;
  return { miniappId, corpId, corpSecret, coverUrl };
};

const getSettings = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      companyId: true,
    },
  });
  if (!user) {
    console.error("get wecom user form phone ");
    throw Error("user is undefined - user id:" + userId);
  }

  return await getSettingsByCompany(user.companyId);
};

/**
 * 企业微信文档 https://developer.work.weixin.qq.com/document/path/95402
 * @param phone
 * @returns
 */
export async function getWecomUserFromPhone(
  userId: number,
  phone: string
): Promise<{ userid: string; errcode: number; errmsg: string } | null> {
  try {
    const wecomSettings = await getSettings(userId);

    const corpId = wecomSettings?.corpId || "undefined";
    const corpSecret = wecomSettings?.corpSecret || "undefined";

    const token = await getAccessToken(corpId, corpSecret);
    console.log("using token ", token);

    if (token) {
      const result = await POST(
        API + "/user/getuserid?access_token=" + token.token,
        {
          body: JSON.stringify({ mobile: phone }),
        }
      );

      console.log("get wecom user form phone ", result);
      return result;
    }

    return null;
  } catch (e) {
    console.error("get Wecom User From Phone failure", userId, e.message);
    return null;
  }
}

const getMiniappMessageJson = (
  {
    touser,
    appid,
    page,
  }: {
    touser: string;
    appid: string;
    page: string;
  },
  { title, description }: { title: string; description: string }
) => {
  return {
    touser,
    msgtype: "miniprogram_notice",
    miniprogram_notice: {
      appid,
      page,
      title,
      description,
      emphasis_first_item: true,
      // content_item: [
      //   {
      //     key: "会议室",
      //     value: "402",
      //   },
      //   {
      //     key: "会议地点",
      //     value: "广州TIT-402会议室",
      //   },
      //   {
      //     key: "会议时间",
      //     value: "2018年8月1日 09:00-09:30",
      //   },
      //   {
      //     key: "参与人员",
      //     value: "周剑轩",
      //   },
      // ],
    },
    enable_id_trans: 0,
    enable_duplicate_check: 0,
    duplicate_check_interval: 1800,
  };
};

export async function sendMiniappMessage(
  userId: number,
  touser: string,
  title: string,
  params?: { key: string; value: string }[]
) {
  try {
    console.log("start to send message", userId, touser, title);
    const wecomSettings = await getSettings(userId);

    const appid = wecomSettings?.miniappId;
    const corpId = wecomSettings?.corpId || "undefined";
    const corpSecret = wecomSettings?.corpSecret || "undefined";
    const coverUrl = wecomSettings?.coverUrl;

    const token = await getAccessToken(corpId, corpSecret);
    console.log("using token ", token);

    if (token) {
      // const payload = getMiniappMessageJson(
      //   {
      //     touser,
      //     page: "/pages/index/index",
      //     appid,
      //   },
      //   { title, description: format(new Date(), "yyyy-MM-dd") }
      // );
      const result = await POST(
        API + "/message/send?access_token=" + token.token,
        {
          body: JSON.stringify({
            touser: touser,
            msgtype: "news",
            agentid: 1000002,
            news: {
              articles: [
                {
                  title: title || "阅卷通",
                  picurl: coverUrl,
                  appid,
                  pagepath: "/pages/index/index",
                },
              ],
            },
          }),
        }
      );

      console.log("send wecom message result: ", result);
      return result;
    }

    return null;
  } catch (e) {
    console.error("send Miniapp Message failure", userId, e.message);
    return null;
  }
}

export async function sendMsgToExternalContact(
  userId: number,
  sender: string,
  externalUserId: string,
  title: string,
  params?: { key: string; value: string }[]
) {
  try {
    const wecomSettings = await getSettings(userId);

    const miniappId = wecomSettings?.miniappId;
    const corpId = wecomSettings?.corpId || "undefined";
    const corpSecret = wecomSettings?.corpSecret || "undefined";

    const token = await getAccessToken(corpId, corpSecret);
    console.log(
      "send Msg To External Contact",
      title,
      externalUserId,
      sender,
      userId
    );

    if (token) {
      const media = await prisma.wecomMedia.findUnique({
        where: {
          type: "miniapp",
        },
      });
      const result = await POST(
        API + "/externalcontact/add_msg_template?access_token=" + token.token,
        {
          body: JSON.stringify({
            external_userid: [externalUserId],
            sender: sender,
            // external_userid: ["wme5GOCgAAKKOMKtmGzpo2sbZhgcoMHg"],
            // sender: "cxu",
            // text: {
            //   content: title,
            // },
            // attachments: [
            // {
            //   msgtype: "image",
            //   image: {
            //     media_id: "MEDIA_ID",
            //     pic_url: "https://picsum.photos/200",
            //   },
            // },
            // {
            //   msgtype: "miniprogram",
            miniprogram: {
              title: title || "阅卷通",
              pic_media_id: media?.mediaId,
              appid: miniappId,
              page: "/pages/index/index",
            },
            // },
            // ],
          }),
        }
      );

      console.log("send message to external contact result: ", result);
      return result;
    }

    return null;
  } catch (e) {
    console.error(
      "send Miniapp Message to external contact failure",
      userId,
      e.message
    );
    return null;
  }
}

/**
 * 企业微信文档 https://open.work.weixin.qq.com/wwopen/devtool/interface?doc_id=15445
 * @param userId
 * @returns
 */
export async function getWecomUserExternalContacts(
  userId: number,
  wecomeUserId: string
) {
  const wecomSettings = await getSettings(userId);

  const corpId = wecomSettings?.corpId || "undefined";
  const corpSecret = wecomSettings?.corpSecret || "undefined";

  const token = await getAccessToken(corpId, corpSecret);
  console.log("using token ", token);

  if (token) {
    const result = await GET(
      API +
        `/externalcontact/list?access_token=${token.token}&&userid=${wecomeUserId}`
      // {
      //   body: JSON.stringify({ mobile: phone }),
      // }
    );

    console.log("get wecom user form phone ", result);

    if (result.errmsg === "ok") {
      return result.external_userid;
    }
    console.error("get wecom user external contacts fail: ", result);
  }

  throw Error("读取用户联系人失败");
}

/**
 * 企业微信文档 https://open.work.weixin.qq.com/wwopen/devtool/interface?doc_id=13878
 * @param externalUserId
 * @returns
 */
export async function getWecomUserExternalContactDetails(
  userId: number,
  externalUserId: string
) {
  const wecomSettings = await getSettings(userId);

  const corpId = wecomSettings?.corpId || "undefined";
  const corpSecret = wecomSettings?.corpSecret || "undefined";

  const token = await getAccessToken(corpId, corpSecret);
  console.log("using token ", token);

  if (token) {
    const result = await GET(
      API +
        `/externalcontact/get?access_token=${token.token}&&external_userid=${externalUserId}`
      // {
      //   body: JSON.stringify({ mobile: phone }),
      // }
    );

    if (result.errmsg === "ok") {
      return result.external_contact;
    }
    console.error("get wecom user external contact detail fail: ", result);
    return result;
  }

  return null;
}
