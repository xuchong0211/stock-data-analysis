import { message } from "antd";
import { GetServerSideProps } from "next";
import { getCsrfToken } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserInvite } from "@prisma/client";

async function registerUser(data: any) {
  try {
    const result = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({
        ...data,
      }),
    });

    if (result.status === 200) {
      return await result.json();
    } else {
      return null;
    }
  } catch (err) {
    console.log("create user error");
    return null;
  }
}

const inputStyle =
  "w-full mt-2 border-gray-300 border rounded-md p-2 focus:outline-none";

function SingUp({
  onRegister,
}: {
  onRegister: (phone: string) => void;
}) {
  const [data, setData] = useState({});
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-2xl flex flex-col w-full animate-fade-in-up"
      style={{ width: "35%" }}
    >
      <div className="flex flex-col justify-center items-center w-full">
        <h2 className="text-2xl bold text-gray-900 my-4">
          {"账号注册"}
        </h2>
        <span className="text-xs text-gray-400">
          输入姓名、手机号获取验证码注册
        </span>
        <div className="flex flex-col my-4 w-full">
          <label className="mb-4 block">
            <div className="text-gray-900">姓名</div>
            <input
              name="name"
              type="text"
              className={inputStyle}
              style={{ height: 40 }}
              placeholder="请输入您的姓名"
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </label>
          <label className="mb-4 block relative">
            <div className="text-gray-900">手机号</div>
            <div className="w-full mt-2 border-gray-300 border rounded-md flex items-center justify-between">
              <input
                name="phone"
                type="text"
                className="w-2/5 p-2 rounded-md focus:outline-none"
                style={{ height: 40 }}
                placeholder="请输入正确的手机号"
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
              <span
                className="text-blue-400 p-2"
                onClick={() => message.info("开发环境可随意输入验证码")}
              >
                获取验证码
              </span>
            </div>
          </label>
          <label className="mb-4 block">
            <div className="text-gray-900">验证码</div>
            <input
              name="code"
              type="password"
              className={inputStyle}
              style={{ height: 40 }}
              placeholder="请输入验证码"
            />
          </label>
          <button
            type="submit"
            className="mt-4 place-self-center w-2/5 bg-blue-400 text-white py-2 px-12 rounded-full shadow-xl"
            onClick={async () => {
              console.log("register user ", data);
              const user = await registerUser(data
              );

              if (user.id) {
                onRegister(user.phone);
              } else {
                message.error("注册失败");
              }
            }}
          >
            注册
          </button>
        </div>
        <div>
          <span className="text-gray-400">已有账号?</span>
          <span
            className="text-blue-400 underline ml-2"
            onClick={async () => {
              onRegister("");
            }}
          >
            登录
          </span>
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  csrfToken,
  onRegister,
  loginName,
}: {
  loginName: string;
  csrfToken: string;
  onRegister: () => void;
}) {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-2xl flex flex-col w-full animate-fade-in-down"
      style={{ width: "35%" }}
    >
      <br />

      <div className="flex flex-col justify-center items-center w-full">
        <h2 className="text-2xl bold text-gray-900">验证码登录</h2>
        <span className="text-xs text-gray-400">输入手机号获取验证码登录</span>
        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="flex flex-col my-4 w-full"
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <label className="mb-4 block">
            <div className="text-gray-900">手机号</div>
            <input
              name="username"
              type="text"
              className={inputStyle}
              defaultValue={"15527350287"}
              style={{ height: 40 }}
              placeholder="请输入正确的手机号"
            />
          </label>
          <label className="mb-4 block">
            <div className="text-gray-900">验证码</div>
            <div className="w-full mt-2 border-gray-300 border rounded-md flex items-center justify-between">
              <input
                name="password"
                type="password"
                className="w-2/5 p-2 rounded-md focus:outline-none"
                style={{ height: 40 }}
                placeholder="请输入验证码"
              />
              <span
                className="text-blue-400 p-2"
                onClick={() => message.info("开发环境请使用1234登录")}
              >
                获取验证码
              </span>
            </div>
          </label>

          <button
            type="submit"
            className="mt-4 place-self-center w-2/5 bg-blue-400 text-white py-2 px-12 rounded-full shadow-xl"
          >
            登录
          </button>
        </form>
        <div>
          <span className="text-gray-400">没有账号?</span>
          <span className="text-blue-400 underline ml-2" onClick={onRegister}>
            立即注册
          </span>
        </div>
      </div>
    </div>
  );
}
export default function SignIn({
  csrfToken,
}: {
  csrfToken: string;
}) {
  const [loginName, setLoginName] = useState<string | null>("");

  return (
    <div
      className="h-screen w-screen flex justify-center items-center"
      style={{
        backgroundImage: "url(/background.png)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {loginName != null ? (
        <LoginForm
          csrfToken={csrfToken}
          loginName={loginName}
          onRegister={() => setLoginName(null)}
        />
      ) : (
        <SingUp onRegister={(phone) => setLoginName(phone)} />
      )}
    </div>
  );
}

SignIn.noauth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
};
