// Config plugin: adopt the iOS scene life cycle, which iOS 27 requires (apps without it crash at
// launch with "UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption").
//
// Expo SDK 57 ships ExpoAppSceneDelegate, but its prebuild template still starts React Native from
// the app delegate. This plugin:
//   1. adds a UIApplicationSceneManifest to Info.plist pointing at EXExpoAppSceneDelegate, and
//   2. makes AppDelegate an ExpoReactNativeFactoryProvider and stops it creating the window, so
//      the scene delegate creates the window and starts React Native instead.
// Remove it once Expo's template does this itself.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE = 'EXExpoAppSceneDelegate';

const START_IN_APP_DELEGATE =
  /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\s*/;

function withSceneManifest(config) {
  return withInfoPlist(config, (c) => {
    c.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          { UISceneConfigurationName: 'Default', UISceneDelegateClassName: SCENE_DELEGATE },
        ],
      },
    };
    return c;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (c) => {
    if (c.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: expected a Swift AppDelegate');
    }
    let src = c.modResults.contents;
    if (!src.includes('ExpoReactNativeFactoryProvider')) {
      src = src.replace(
        'class AppDelegate: ExpoAppDelegate {',
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      );
    }
    if (START_IN_APP_DELEGATE.test(src)) {
      src = src.replace(
        START_IN_APP_DELEGATE,
        '    // The scene delegate (EXExpoAppSceneDelegate) creates the window and starts React Native.\n    ',
      );
    }
    if (!src.includes('ExpoReactNativeFactoryProvider') || src.includes('UIWindow(frame: UIScreen.main.bounds)')) {
      throw new Error('withSceneLifecycle: AppDelegate.swift has an unexpected shape; update the plugin');
    }
    c.modResults.contents = src;
    return c;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneAppDelegate(withSceneManifest(config));
};
