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
    // 签名配置
    osxSign: {
      identity: "Developer ID Application", // 自动匹配 Developer ID Application 证书
      hardenedRuntime: true,
      entitlements: path.join(__dirname, "entitlements.mac.plist"),
      "entitlements-inherit": path.join(__dirname, "entitlements.mac.plist"),
      "gatekeeper-assess": false,
    },

    // 公证配置
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_PWD, // 注意这里用 APPLE_APP_PWD
      teamId: process.env.APPLE_TEAM_ID,
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
