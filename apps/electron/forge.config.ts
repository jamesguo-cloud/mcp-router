import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import { MakerDMG } from "@electron-forge/maker-dmg";
import * as path from "path";
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const config: ForgeConfig = {
  packagerConfig: {
    // 关键：启用 asar，满足 AutoUnpackNatives 插件要求
    asar: true,

    // 代码签名（Developer ID Application）
    osxSign: {
      identity: "Developer ID Application",   // 会匹配钥匙串里的 Developer ID Application
      hardenedRuntime: true,
      // 如无特别需求，可先不带 entitlements 文件，跑通后再加
      // entitlements: path.join(__dirname, "entitlements.mac.plist"),
      // "entitlements-inherit": path.join(__dirname, "entitlements.mac.plist"),
      "gatekeeper-assess": false,
    },

    // 公证（使用你 workflow 里的环境变量）
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
      // 可选：超时重试等参数
      // tool: "notarytool",
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: "MCP-Router",
      authors: "fjm2u",
      description:
        "Effortlessly manage your MCP servers with the MCP Router. MCP Router provides a user-friendly interface for managing MCP servers, making it easier than ever to work with the MCP.",
      setupIcon: "./public/images/icon/icon.ico",
    }),
    new MakerDMG(
      {
        name: "MCP Router",
        format: "ULFO",
        icon: "./public/images/icon/icon.icns",
      },
      ["darwin"],
    ),
    new MakerZIP(),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.tsx",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
          {
            html: "./src/background.html",
            js: "./src/background.tsx",
            name: "background_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        authToken: process.env.GITHUB_TOKEN,
        repository: {
          owner: "mcp-router",
          name: "mcp-router",
        },
        prerelease: true,
        draft: true,
      },
    },
  ],
};

export default config;
