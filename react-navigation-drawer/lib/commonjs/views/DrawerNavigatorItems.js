var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _interopRequireWildcard=require("@babel/runtime/helpers/interopRequireWildcard");Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _possibleConstructorReturn2=_interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2=_interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _inherits2=_interopRequireDefault(require("@babel/runtime/helpers/inherits"));var React=_interopRequireWildcard(require("react"));var _reactNative=require("react-native");var _reactNavigation=require("react-navigation");var _TouchableItem=_interopRequireDefault(require("./TouchableItem"));var _jsxFileName="/Users/victor/Library/Caches/Yarn/v6/.tmp/53d64cead47123a7712545e8f77089b7.edcb5587e3825005ec057d83fbbf3dd7ed216945.prepare/src/views/DrawerNavigatorItems.tsx";var DrawerNavigatorItems=function(_React$Component){(0,_inherits2.default)(DrawerNavigatorItems,_React$Component);function DrawerNavigatorItems(){(0,_classCallCheck2.default)(this,DrawerNavigatorItems);return(0,_possibleConstructorReturn2.default)(this,(0,_getPrototypeOf2.default)(DrawerNavigatorItems).apply(this,arguments));}(0,_createClass2.default)(DrawerNavigatorItems,[{key:"getActiveTintColor",value:function getActiveTintColor(){var activeTintColor=this.props.activeTintColor;if(!activeTintColor){return;}else if(typeof activeTintColor==='string'){return activeTintColor;}return activeTintColor[this.context];}},{key:"getInactiveTintColor",value:function getInactiveTintColor(){var inactiveTintColor=this.props.inactiveTintColor;if(!inactiveTintColor){return;}else if(typeof inactiveTintColor==='string'){return inactiveTintColor;}return inactiveTintColor[this.context];}},{key:"getActiveBackgroundColor",value:function getActiveBackgroundColor(){var activeBackgroundColor=this.props.activeBackgroundColor;if(!activeBackgroundColor){return;}else if(typeof activeBackgroundColor==='string'){return activeBackgroundColor;}return activeBackgroundColor[this.context];}},{key:"getInactiveBackgroundColor",value:function getInactiveBackgroundColor(){var inactiveBackgroundColor=this.props.inactiveBackgroundColor;if(!inactiveBackgroundColor){return;}else if(typeof inactiveBackgroundColor==='string'){return inactiveBackgroundColor;}return inactiveBackgroundColor[this.context];}},{key:"render",value:function render(){var _this$props=this.props,items=_this$props.items,activeItemKey=_this$props.activeItemKey,getLabel=_this$props.getLabel,renderIcon=_this$props.renderIcon,onItemPress=_this$props.onItemPress,itemsContainerStyle=_this$props.itemsContainerStyle,itemStyle=_this$props.itemStyle,labelStyle=_this$props.labelStyle,activeLabelStyle=_this$props.activeLabelStyle,inactiveLabelStyle=_this$props.inactiveLabelStyle,iconContainerStyle=_this$props.iconContainerStyle,drawerPosition=_this$props.drawerPosition;var activeTintColor=this.getActiveTintColor();var activeBackgroundColor=this.getActiveBackgroundColor();var inactiveTintColor=this.getInactiveTintColor();var inactiveBackgroundColor=this.getInactiveBackgroundColor();return React.createElement(_reactNative.View,{style:[styles.container,itemsContainerStyle],__source:{fileName:_jsxFileName,lineNumber:102}},items.map(function(route,index){var _ref;var focused=activeItemKey===route.key;var color=focused?activeTintColor:inactiveTintColor;var backgroundColor=focused?activeBackgroundColor:inactiveBackgroundColor;var scene={route:route,index:index,focused:focused,tintColor:color};var icon=renderIcon(scene);var label=getLabel(scene);var accessibilityLabel=typeof label==='string'?label:undefined;var extraLabelStyle=focused?activeLabelStyle:inactiveLabelStyle;return React.createElement(_TouchableItem.default,{key:route.key,accessible:true,accessibilityLabel:accessibilityLabel,onPress:function onPress(){onItemPress({route:route,focused:focused});},delayPressIn:0,__source:{fileName:_jsxFileName,lineNumber:118}},React.createElement(_reactNavigation.SafeAreaView,{style:[{backgroundColor:backgroundColor},styles.item,itemStyle],forceInset:(_ref={},(0,_defineProperty2.default)(_ref,drawerPosition,'always'),(0,_defineProperty2.default)(_ref,drawerPosition==='left'?'right':'left','never'),(0,_defineProperty2.default)(_ref,"vertical",'never'),_ref),__source:{fileName:_jsxFileName,lineNumber:127}},icon?React.createElement(_reactNative.View,{style:[styles.icon,focused?null:styles.inactiveIcon,iconContainerStyle],__source:{fileName:_jsxFileName,lineNumber:136}},icon):null,typeof label==='string'?React.createElement(_reactNative.Text,{style:[styles.label,{color:color},labelStyle,extraLabelStyle],__source:{fileName:_jsxFileName,lineNumber:147}},label):label));}));}}]);return DrawerNavigatorItems;}(React.Component);exports.default=DrawerNavigatorItems;DrawerNavigatorItems.defaultProps={activeTintColor:{light:'#2196f3',dark:'#fff'},activeBackgroundColor:{light:'rgba(0, 0, 0, .04)',dark:'rgba(255, 255, 255, .04)'},inactiveTintColor:{light:'rgba(0, 0, 0, .87)',dark:'rgba(255, 255, 255, .87)'},inactiveBackgroundColor:{light:'transparent',dark:'transparent'}};DrawerNavigatorItems.contextType=_reactNavigation.ThemeContext;var styles=_reactNative.StyleSheet.create({container:{paddingVertical:4},item:{flexDirection:'row',alignItems:'center'},icon:{marginHorizontal:16,width:24,alignItems:'center'},inactiveIcon:{opacity:0.62},label:{margin:16,fontWeight:'bold'}});
//# sourceMappingURL=DrawerNavigatorItems.js.map