import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import * as path from "path";
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    osxSign: { 
      identity: "Developer ID Application: XianQuan Guo (MUFZ22C54K)",
      hardenedRuntime: true,
      entitlements: path.join(__dirname, "entitlements.mac.plist"),
      "entitlements-inherit": path.join(__dirname, "entitlements.mac.plist"),
      "gatekeeper-assess": false,
    },
    // ⚠️ 调试阶段先去掉 osxNotarize，确认签名成功后再加回
    // osxNotarize: {
    //   appleId: process.env.APPLE_ID,
    //   appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    //   teamId: process.env.APPLE_TEAM_ID,
    //   tool: "notarytool",
    // },
  },
  rebuildConfig: {},
  makers: [
    // ✅ Mac-only 配置
    new MakerDMG({
      name: "MCP Router",
      format: "ULFO",
      icon: "./public/images/icon/icon.icns",
    }),
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
            preload: { js: "./src/preload.ts" },
          },
          {
            html: "./src/background.html",
            js: "./src/background.tsx",
            name: "background_window",
            preload: { js: "./src/preload.ts" },
          },
        ],
      },
    }),
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
};

export default config;
