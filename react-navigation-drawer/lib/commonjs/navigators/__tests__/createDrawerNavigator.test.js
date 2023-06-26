var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _interopRequireWildcard=require("@babel/runtime/helpers/interopRequireWildcard");var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _possibleConstructorReturn2=_interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2=_interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _inherits2=_interopRequireDefault(require("@babel/runtime/helpers/inherits"));var React=_interopRequireWildcard(require("react"));var _reactNative=require("react-native");var _reactNativeTestingLibrary=require("react-native-testing-library");var _reactNavigation=require("react-navigation");var _createDrawerNavigator=_interopRequireDefault(require("../createDrawerNavigator"));var _jsxFileName="/Users/victor/Library/Caches/Yarn/v6/.tmp/53d64cead47123a7712545e8f77089b7.edcb5587e3825005ec057d83fbbf3dd7ed216945.prepare/src/navigators/__tests__/createDrawerNavigator.test.tsx";var HomeScreen=function(_React$Component){(0,_inherits2.default)(HomeScreen,_React$Component);function HomeScreen(){(0,_classCallCheck2.default)(this,HomeScreen);return(0,_possibleConstructorReturn2.default)(this,(0,_getPrototypeOf2.default)(HomeScreen).apply(this,arguments));}(0,_createClass2.default)(HomeScreen,[{key:"render",value:function render(){return React.createElement(_reactNative.View,{style:{flex:1},__source:{fileName:_jsxFileName,lineNumber:17}});}}]);return HomeScreen;}(React.Component);HomeScreen.navigationOptions=function(_ref){var navigation=_ref.navigation;return{title:"Welcome "+(navigation.state.params?navigation.state.params.user:'anonymous'),gesturesEnabled:true};};it('renders successfully',function(){var MyDrawerNavigator=(0,_createDrawerNavigator.default)({Home:HomeScreen});var App=(0,_reactNavigation.createAppContainer)(MyDrawerNavigator);var rendered=(0,_reactNativeTestingLibrary.render)(React.createElement(App,{__source:{fileName:_jsxFileName,lineNumber:24}})).toJSON();expect(rendered).toMatchInlineSnapshot("\n    <View\n      collapsable={false}\n      onGestureHandlerEvent={[Function]}\n      onGestureHandlerStateChange={[Function]}\n      onLayout={[Function]}\n      style={\n        Object {\n          \"flex\": 1,\n          \"overflow\": \"hidden\",\n        }\n      }\n    >\n      <View\n        importantForAccessibility=\"yes\"\n        style={\n          Object {\n            \"flex\": 1,\n            \"transform\": Array [\n              Object {\n                \"translateX\": 0,\n              },\n            ],\n          }\n        }\n      >\n        <View\n          style={\n            Object {\n              \"flex\": 1,\n            }\n          }\n        >\n          <View\n            collapsable={false}\n            pointerEvents=\"auto\"\n            removeClippedSubviews={false}\n            style={\n              Array [\n                Object {\n                  \"flex\": 1,\n                  \"overflow\": \"hidden\",\n                },\n                Array [\n                  Object {\n                    \"bottom\": 0,\n                    \"left\": 0,\n                    \"position\": \"absolute\",\n                    \"right\": 0,\n                    \"top\": 0,\n                  },\n                  Object {\n                    \"opacity\": 1,\n                  },\n                ],\n              ]\n            }\n          >\n            <View\n              style={\n                Object {\n                  \"flex\": 1,\n                }\n              }\n            >\n              <View\n                style={\n                  Object {\n                    \"flex\": 1,\n                  }\n                }\n              />\n            </View>\n          </View>\n        </View>\n        <View\n          collapsable={false}\n          onGestureHandlerEvent={[Function]}\n          onGestureHandlerStateChange={[Function]}\n          style={\n            Object {\n              \"backgroundColor\": \"rgba(0, 0, 0, 0.5)\",\n              \"bottom\": 0,\n              \"left\": 0,\n              \"opacity\": undefined,\n              \"position\": \"absolute\",\n              \"right\": 0,\n              \"top\": 0,\n              \"zIndex\": undefined,\n            }\n          }\n        />\n      </View>\n      <View\n        accessibilityViewIsModal={false}\n        onLayout={[Function]}\n        removeClippedSubviews={false}\n        style={\n          Object {\n            \"backgroundColor\": \"#fff\",\n            \"bottom\": 0,\n            \"left\": undefined,\n            \"maxWidth\": \"100%\",\n            \"opacity\": Object {},\n            \"position\": \"absolute\",\n            \"top\": 0,\n            \"transform\": Array [\n              Object {\n                \"translateX\": undefined,\n              },\n            ],\n            \"width\": 320,\n            \"zIndex\": 0,\n          }\n        }\n      >\n        <View\n          style={\n            Array [\n              Object {\n                \"flex\": 1,\n              },\n              undefined,\n            ]\n          }\n        >\n          <RCTScrollView\n            alwaysBounceVertical={false}\n          >\n            <View>\n              <View\n                onLayout={[Function]}\n                pointerEvents=\"box-none\"\n                style={\n                  Object {\n                    \"paddingBottom\": 0,\n                    \"paddingLeft\": 0,\n                    \"paddingRight\": 0,\n                    \"paddingTop\": 20,\n                  }\n                }\n              >\n                <View\n                  style={\n                    Array [\n                      Object {\n                        \"paddingVertical\": 4,\n                      },\n                      undefined,\n                    ]\n                  }\n                >\n                  <View\n                    accessibilityLabel=\"Welcome anonymous\"\n                    accessible={true}\n                    isTVSelectable={true}\n                    onResponderGrant={[Function]}\n                    onResponderMove={[Function]}\n                    onResponderRelease={[Function]}\n                    onResponderTerminate={[Function]}\n                    onResponderTerminationRequest={[Function]}\n                    onStartShouldSetResponder={[Function]}\n                    style={\n                      Object {\n                        \"opacity\": 1,\n                      }\n                    }\n                  >\n                    <View\n                      onLayout={[Function]}\n                      pointerEvents=\"box-none\"\n                      style={\n                        Object {\n                          \"alignItems\": \"center\",\n                          \"backgroundColor\": \"rgba(0, 0, 0, .04)\",\n                          \"flexDirection\": \"row\",\n                          \"paddingBottom\": 0,\n                          \"paddingLeft\": 0,\n                          \"paddingRight\": 0,\n                          \"paddingTop\": 0,\n                        }\n                      }\n                    >\n                      <Text\n                        style={\n                          Array [\n                            Object {\n                              \"fontWeight\": \"bold\",\n                              \"margin\": 16,\n                            },\n                            Object {\n                              \"color\": \"#2196f3\",\n                            },\n                            undefined,\n                            undefined,\n                          ]\n                        }\n                      >\n                        Welcome anonymous\n                      </Text>\n                    </View>\n                  </View>\n                </View>\n              </View>\n            </View>\n          </RCTScrollView>\n        </View>\n      </View>\n    </View>\n  ");});
//# sourceMappingURL=createDrawerNavigator.test.js.map