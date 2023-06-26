var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _interopRequireWildcard=require("@babel/runtime/helpers/interopRequireWildcard");Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _extends2=_interopRequireDefault(require("@babel/runtime/helpers/extends"));var React=_interopRequireWildcard(require("react"));var _reactNative=require("react-native");var _reactNavigation=require("react-navigation");var _DrawerRouter=_interopRequireDefault(require("../routers/DrawerRouter"));var _DrawerView=_interopRequireDefault(require("../views/DrawerView"));var _DrawerNavigatorItems=_interopRequireDefault(require("../views/DrawerNavigatorItems"));var _jsxFileName="/Users/victor/Library/Caches/Yarn/v6/.tmp/53d64cead47123a7712545e8f77089b7.edcb5587e3825005ec057d83fbbf3dd7ed216945.prepare/src/navigators/createDrawerNavigator.tsx";function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);if(enumerableOnly)symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable;});keys.push.apply(keys,symbols);}return keys;}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};if(i%2){ownKeys(source,true).forEach(function(key){(0,_defineProperty2.default)(target,key,source[key]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(target,Object.getOwnPropertyDescriptors(source));}else{ownKeys(source).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}}return target;}var defaultContentComponent=function defaultContentComponent(props){return React.createElement(_reactNative.ScrollView,{alwaysBounceVertical:false,__source:{fileName:_jsxFileName,lineNumber:23}},React.createElement(_reactNavigation.SafeAreaView,{forceInset:{top:'always',horizontal:'never'},__source:{fileName:_jsxFileName,lineNumber:24}},React.createElement(_DrawerNavigatorItems.default,(0,_extends2.default)({},props,{__source:{fileName:_jsxFileName,lineNumber:25}}))));};var DefaultDrawerConfig={drawerWidth:function drawerWidth(){var _Dimensions$get=_reactNative.Dimensions.get('window'),height=_Dimensions$get.height,width=_Dimensions$get.width;var smallerAxisSize=Math.min(height,width);var isLandscape=width>height;var isTablet=smallerAxisSize>=600;var appBarHeight=_reactNative.Platform.OS==='ios'?isLandscape?32:44:56;var maxWidth=isTablet?320:280;return Math.min(smallerAxisSize-appBarHeight,maxWidth);},contentComponent:defaultContentComponent,drawerPosition:_reactNative.I18nManager.isRTL?'right':'left',keyboardDismissMode:'on-drag',drawerBackgroundColor:{light:_reactNavigation.ThemeColors.light.bodyContent,dark:_reactNavigation.ThemeColors.dark.bodyContent},overlayColor:{light:'rgba(0, 0, 0, 0.5)',dark:'rgba(0, 0, 0, 0.5)'},drawerType:'front',hideStatusBar:false,statusBarAnimation:'slide'};var DrawerNavigator=function DrawerNavigator(routeConfigs){var config=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var mergedConfig=_objectSpread({},DefaultDrawerConfig,{},config);var drawerRouter=(0,_DrawerRouter.default)(routeConfigs,mergedConfig);var navigator=(0,_reactNavigation.createNavigator)(_DrawerView.default,drawerRouter,mergedConfig);return navigator;};var _default=DrawerNavigator;exports.default=_default;
//# sourceMappingURL=createDrawerNavigator.js.map