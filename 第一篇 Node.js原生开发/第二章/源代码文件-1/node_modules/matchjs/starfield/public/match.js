(function () {
	
	function Class() {
	}

	/**
	 * Adds parent prototype methods to the childs prototype
	 * @method each
	 * @param {Object} descendant object to put the methods from the parents prototype
	 * @param {Object} parent where to take the methods to put in descendant
	 */
	Class.extend = function( child, parent ) {

		if ( !child ) throw new Error("Child is undefined and cannot be extended");
		if ( !parent ) throw new Error("Parent is undefined, you cannot extend child with an undefined parent");
		if ( !parent.name ) throw new Error("Parent name is undefined. Please add a field name to the parent constructor where name is the name of the function. This usually creates issues in Internet Explorer." + parent);

		child.prototype["extends" + parent.name] = parent;

		for (var m in parent.prototype) {

			if ( !child.prototype[m] ) {
				child.prototype[m] = parent.prototype[m];
			} else if ( !child.prototype[parent.name + m]) {
				//Cammel case method name
				child.prototype[parent.name.substr(0, 1).toLowerCase() + parent.name.substr(1) + m.substr(0, 1).toUpperCase() + m.substr(1)] = parent.prototype[m];
			}

		}

	};

	window.Class = Class;

})();(function (namespace) {

	function EventHandler() {
		this._eventListeners = {};	
	}

	EventHandler.prototype.addEventListener = function(name, callback) {
		if ( !this._eventListeners[name] ) {
			this._eventListeners[name] = [];
		}
		this._eventListeners[name].push(callback);
	};
	EventHandler.prototype.on = function() {
		
		var events = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
			callback = arguments[arguments.length -1 ];

		for ( var i = 0; i < events.length; i++ ) {
			this.addEventListener(events[i], callback);
		}

	};
	EventHandler.prototype.off = function() {

		var events = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
			callback = arguments[arguments.length -1 ];

		for ( var i = 0; i < events.length; i++ ) {
			this.removeEventListener(events[i], callback);
		}

	};
	EventHandler.prototype.raise = function(name, data) {
		var eventListeners = this._eventListeners[name];
		if ( eventListeners ) {
			for ( var i = 0, l = eventListeners.length; i < l; i++ ) {
				eventListeners[i](data);
			}
		}
	};
	EventHandler.prototype.raiseEvent = EventHandler.prototype.raise;
	EventHandler.prototype.removeEventListener = function(name, callback) {
		if ( this._eventListeners[name] ) {
			var eventListeners = this._eventListeners[name];
			eventListeners.splice(eventListeners.indexOf(callback), 1);
		}
	};
	EventHandler.prototype.removeAllListeners = function(name) {
		this._eventListeners = {};
	};
	EventHandler.prototype.listensTo = function(name) {
		return this._eventListeners[name];
	};

	EventHandler.name = "EventHandler";

	namespace.EventHandler = EventHandler;

})(window);/**
 * @module Match
 */
(function(namespace) {

	/**
	 * Provides an easy solution to event handling
	 * 
	 * @class EventListener
	 * @constructor
	 * @example 
	 
			function onClickListener(sender) {
				console.log("Clicked on: " + sender);
			}
	 
			var onClick = new M.EventListener();
			
			onClick.addEventListener(onClickListener);
			
			onClick.raise(this);
			
			onClick.removeEventListener(onClickListener);

	 * @example 

			var obj = { name: "Ninja" };

			function onClickListener() {
				console.log("Clicked on: " + this.name); //Will print Ninja
			}
	 
			var onClick = new M.EventListener();
			
			onClick.addEventListener(onClickListener, obj); //Bind execution context to obj
			
			onClick.raise();
			
			onClick.removeEventListener(onClickListener);
	 */
	function EventListener() {
		this.listeners = new Array();
	}
	/**
	 * @method addEventListener
	 * @param {Function} listener 
	 * @param {Object} owner [optional] object to bind the listener to
	 */
	EventListener.prototype.addEventListener = function(listener, owner) {
		if ( owner ) {
			this.listeners.push(new ObjectListener(listener, owner));
		} else {
			this.listeners.push(new FunctionListener(listener));
		}
	};
	/**
	 * @method raise
	 */
	EventListener.prototype.raise = function() {
	
		var i = 0,
			l = this.listeners.length;
		
		if ( l == 0 ) return;
		
		for ( ; i < l; i++ ) {
			this.listeners[i].run(arguments);
		}
		
	};
	/**
	 * @method removeEventListener
	 */
	EventListener.prototype.removeEventListener = function(listener, owner) {
		
		var i = 0,
			l = this.listeners.length,
			currentListener;

		for ( ; i < l; i++ ) {

			currentListener = this.listeners[i];

			if ( currentListener.callback == listener || (currentListener.callbackName == listener && owner == currentListener.object ) ) {

				this.listeners.splice(i, 1);
				return;

			}

		}

	};
	/**
	 * @method removeAllEventListeners
	 *
	 * @return {Array} Array containing the event listeners that are removed
	 */
	EventListener.prototype.removeAllEventListeners = function() {
		this.listeners = new Array();
		return listeners;
	};

	EventListener.name = "EventListener";

	namespace.EventListener = EventListener;

	/**
	 * Wraps a function to use it as a listener
	 * 
	 * @class FunctionListener
	 * @constructor
	 * @param {Function} callback function to invoke
	 */
	function FunctionListener(callback) {
		this.callback = callback;
	}
	/**
	 * Invokes callback function
	 * @method run
	 */
	FunctionListener.prototype.run = function(args) {
		this.callback(args[0]);
	};

	/**
	 * Wraps an object and the callback name
	 * 
	 * @class ObjectListener
	 * @constructor
	 * @param {String} callbackName name of the function to call
	 * @param {Object} object object in which to invoke the callback
	 */
	function ObjectListener(callbackName, object) {
		this.callbackName = callbackName;
		this.object = object;
	}
	/**
	 * Invokes callback function on object
	 * @method run
	 */
	ObjectListener.prototype.run = function(args) {
		this.object[this.callbackName](args[0]);
	};

})(window);(function (namespace) {

	// var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	// var ARGUMENT_NAMES = /([^\s,]+)/g;

	// function getParamNames(func) {

	// 	var fnStr = func.toString().replace(STRIP_COMMENTS, ''),
	// 		result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).ModuleManager(ARGUMENT_NAMES);
		
	// 	if(result == null) {
	// 		result = [];
	// 	}

	// 	return result

	// }

	function ModuleManager() {
		this.modules = {};
	}

	/**
	 * Defines a new module where the first parameter is the name, last parameter is the constructor
	 * and parameters in the middle are dependencies
	 */
	ModuleManager.prototype.defineModule = function() {

		var module = {
			"requires": Array.prototype.slice.call(arguments, 1, arguments.length - 1),
			"name": arguments[0],
			"constructor": arguments[arguments.length - 1]
		};

		// if ( module.requires.length == 0 ) {
		// 	module.requires = getParamNames(module.constructor);
		// }

		this.modules[module.name] = module;

	};
	/**
	 * Gets a module provided the required modules have been defined
	 */
	ModuleManager.prototype.getModule = function(name) {

		var module = this.modules[name],
			requiredModules = [],
			canBeLoaded = true;

		if ( module ) {

			for ( var i = 0; i < module.requires.length; i++ ) {
			
				var requiredModule = this.modules[module.requires[i]];
			
				if ( requiredModule ) {

					if ( !requiredModule.cache ) {
						requiredModule.cache = this.getModule(requiredModule.name);
					}

					requiredModules.push(requiredModule.cache);

				} else {
					canBeLoaded = false;
					break;
				}
			
			}

			if ( canBeLoaded ) {
				return module.constructor.apply(module.constructor, requiredModules);
			}

		}

		return {};

	};
	/**
	 * Short-hand to getModule and defineModule
	 * Calls getModule if argument length equals 1 otherwise calls defineModule
	 */
	ModuleManager.prototype.module = function() {
		if ( arguments.length == 1 ) {
			return this.getModule(arguments[0]);
		} else {
			this.defineModule.apply(this, arguments);
			return this;
		}
	};

	namespace.ModuleManager = ModuleManager;

}(window));(function (namespace) {

	/**
	 * Simple implementation of a map that consists of two arrays, one is used as an
	 * index of keys and the other is used to store the items.
	 * This way we take advantage of javascript native object key-value
	 * and the speed of iterating a simple array.
	 *
	 * You can use the build-in method eachValue to quickly iterate through all values
	 * of the map or just use a traditional for-loop on attribute _values. Please do not
	 * modify _values array, use the map methods to do it.
	 *
	 * @class SimpleMap
	 * @constructor
	 */
	function SimpleMap() {
		this._keys = {};
		this._values = [];
		this.length = 0;
	}
	/**
	 * Pushes an item into the map
	 * @method push
	 * @param {Object} key object representing unique id
	 * @param {Object} value value to add
	 */
	SimpleMap.prototype.set = function(key, value) {

		var existingIndex = this._keys[key];

		if ( existingIndex ) {
			this._values[existingIndex] = value;
		} else {
			var valueIndex = this._values.push(value) - 1;
			this._keys[key] = valueIndex;
			this.length++;
		}

	};
	/**
	 * Removes all items
	 * @method clear
	 */
	SimpleMap.prototype.clear = function() {
		this._keys = {};
		this._values = [];
		this.length = 0;
	};
	/**
	 * Gets the item that matches the given key
	 * @method get
	 * @param {Object} key object representing unique id
	 * @return {Object}
	 */
	SimpleMap.prototype.get = function(key) {
		return this._values[this._keys[key]];
	};
	/**
	 * Removes the item by the given key
	 * @method remove
	 * @param {Object} key object representing unique id
	 */
	SimpleMap.prototype.remove = function(key) {
		
		var index = this._keys[key];
		
		if ( index == undefined ) {
			return;
		}

		this._values.splice(index, 1);
		
		delete this._keys[key];
		
		this.length--;
		
		for ( var i in this._keys ) {
			if ( this._keys[i] > index ) {
				this._keys[i]--;
			}
		}
		
	};
	/**
	 * Iterates through all values and invokes a callback
	 * @method eachValue
	 * @param {Function} callback
	 */
	SimpleMap.prototype.eachValue = function(callback) {
		var i = 0,
			l = this._values.length,
			v = this._values;
		for ( ; i < l; i++ ) {
			callback(v[i]);
		}
	};
	/**
	 * Iterates through all keys and invokes a callback
	 * @method eachKey
	 * @param {Function} callback
	 */
	SimpleMap.prototype.eachKey = function(callback) {
		for ( var key in this._keys ) {
			callback(key);
		}
	};
	/**
	 * Iterates through all values and invokes a callback passing key and value as arguments respectively
	 * @method each
	 * @param {Function} callback
	 */
	SimpleMap.prototype.each = function(callback) {
		for ( var key in this._keys ) {
			callback(key, this.get(key));
		}
	};

	SimpleMap.name = "SimpleMap";

	namespace.SimpleMap = SimpleMap;

})(window);(function (namespace, SimpleMap, EventListener) {
	
	function EventSimpleMap() {
		this.extendsSimpleMap();
		this.onSet = new EventListener();
		this.onRemoved = new EventListener();
	}
	
	EventSimpleMap.prototype.set = function(key, value) {
		this.simpleMapSet(key, value);
		this.onSet.raise(key);
	};
	EventSimpleMap.prototype.remove = function(key) {
		this.simpleMapRemove(key);
		this.onRemoved.raise(key);
	};
	
	Class.extend(EventSimpleMap, SimpleMap);
	
	namespace.EventSimpleMap = EventSimpleMap;
	
})(window, SimpleMap, EventListener);(function (namespace) {

	function DefaultLogger() {
	}
	
	DefaultLogger.prototype.joinArgs = function(args) {
		var values = [];
		for ( var i in args ) {
			values.push(args[i]);
		}
		return values.join(" ");
	};

	if ( window.console ) {

		if ( window.console.log ) {
			DefaultLogger.prototype.log = function () {
				window.console.log(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.log = function (value) {
				alert(this.joinArgs(arguments));
			}
		}
		if ( window.console.warn ) {
			DefaultLogger.prototype.warn = function (value) {
				window.console.warn(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		}
		if ( window.console.error ) {
			DefaultLogger.prototype.error = function (value) {
				window.console.error(this.joinArgs(arguments));
			}
		} else {
			DefaultLogger.prototype.error = DefaultLogger.prototype.log;
		}

	} else {
		
		DefaultLogger.prototype.log = function(value) {
			alert(this.joinArgs(arguments));
		}
		DefaultLogger.prototype.debug = DefaultLogger.prototype.log;
		DefaultLogger.prototype.warn = DefaultLogger.prototype.log;
		DefaultLogger.prototype.error = DefaultLogger.prototype.log;

	}
	
	namespace.DefaultLogger = DefaultLogger;

})(window);/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2011 Pablo Lagioia, Puzzling Ideas
 *
 * Match Game Engine v1.5
 * http://puzzlingideas.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
var M = window.M || {},
	game = window.game || {};

/**
 * @module window
 */
(function(namespace) {

	if ( namespace.Match ) return;

	/**
	 * Provides information about the current browser
	 * @class Browser
	 * @readOnly
	 */
	function Browser() {

		var browsers = ["Firefox", "Chrome", "Opera", "Safari", "MSIE 9.0", "BlackBerry"],
		i,
		browserName;

		/**
		 * The name of the current browser
		 * @property name
		 * @readOnly
		 * @type String
		 * @example
				"Firefox"
		 */
		this.name = undefined;

		for ( i in browsers ) {
			browserName = browsers[i];
			this["is" + browserName] = ( navigator.userAgent.indexOf(browserName) != -1 );
			if ( !this.name && this["is" + browserName] ) {
				this.name = browserName;
			}
		}

		/**
		 * The extension of the audio format supported by the current browser
		 * @property supportedAudioFormat
		 * @readOnly
		 * @type String
		 * @example
				".mp3"
		 */
		this.supportedAudioFormat = this.getBrowserPreferredAudioFormat();

		/**
		 * Boolean indicating if the current browser is supported or not
		 * @property supported
		 * @readOnly
		 * @type Boolean
		 */
		this.supported = this.name != undefined;

	};

	/**
	 * Returns the audio extension supported by the current browser.
	 * @method getBrowserPreferredAudioFormat
	 * @private
	 * @return {String} the supported extension
	 */
	Browser.prototype.getBrowserPreferredAudioFormat = function() {

		var a = document.createElement("audio");

		if ( a.canPlayType( "audio/ogg" ) != "" ) return ".ogg";
		if ( a.canPlayType( "audio/mpeg" ) != "" ) return ".mp3";
		if ( a.canPlayType( "audio/wav" ) != "" ) return ".wav";
		if ( a.canPlayType( "audio/mp4" ) != "" ) return ".mp4";

		this.logger.warn("This browser does not support audio");

	};

	/**
	 * Returns the audio extension supported by the current browser.
	 * @method getBrowserAudioSupportedFormats
	 * @private
	 * @return {String} the supported extension
	 */
	Browser.prototype.getBrowserAudioSupportedFormats = function() {

		var a = document.createElement("audio"),
			f = new Array();

		if ( a.canPlayType( "audio/ogg" ) != "" ) f.push(".ogg");
		if ( a.canPlayType( "audio/mpeg" ) != "" ) f.push(".mp3");
		if ( a.canPlayType( "audio/wav" ) != "" ) f.push(".wav");
		if ( a.canPlayType( "audio/mp4" ) != "" ) f.push(".mp4");

		return f.join("|");

	};

	/**
	 * Contains information about the current device
	 * @class Device
	 * @readOnly
	 */
	function Device() {
	
		var devices = ["Android", "BlackBerry", "iPhone", "iPad", "iPod", "IEMobile"],
			i;
		
		/**
		 * The name of the current device
		 * @property name
		 * @type String
		 * @example
				"PC"
		* @example
				"Android"
		 */
		
		/**
		 * Boolean that determines if the current device is mobile
		 * @property isMobile
		 * @type Boolean
		 * @example
				false
		 */

		for ( i in devices ) {
			deviceName = devices[i];
			this["is" + deviceName] = ( navigator.userAgent.indexOf( deviceName ) != -1 );
			if ( !this.name && this["is" + deviceName] ) {
				this.name = deviceName;
			}
		}
		
		if ( this.name ) {
			this.isMobile = true;
		} else {
			this.isMobile = false;
			this.name = "PC";
		}
	
	}

	/**
	 * Match Game Engine.
	 * When DOMContentLoaded event is executed the game loop starts. 
	 * If window has a function called main, that function gets executed once after Match has finished loading
	 *
	 * @constructor
	 * @class Match
	 * @static
	 *
	 */
	function Match() {

		this.extendsModuleManager();
		this.extendsEventHandler();

		this.autowire = true;
		
		this.logger = new DefaultLogger();
		/**
		 * Determines whether to loop though the onLoop list
		 * @property _isPlaying
		 * @private
		 * @type Boolean
		 */
		this._isPlaying = false;
		/**
		 * Array of GameLayer. Match loops the objects in this array calling the onLoop method of each of them. This operation
		 * involves rendering that takes place in the layers. Match loops this list after looping the gameObjects array thus, ensuring,
		 * no input or updates affects rendering.
		 * @property _gameLayers
		 * @private
		 * @type Array
		 */
		// this._gameLayers = new EventSimpleMap();
		this._gameLayers = new SimpleMap();
		/**
		 * Array of GameObject. Match loops the objects in this array calling the onLoop method of each of them. This operation
		 * does not involve rendering. Match loops this list first, updates every object and once that is finished it loops
		 * the game layers
		 * @property _gameObjects
		 * @private
		 * @type Array
		 */
		this._gameObjects = new Array();
		/**
		 * Array of Triggers
		 * @property _gameObjects
		 * @private
		 * @type Array
		 */
		this._triggers = new Array();
		/**
		 * Cache used for retrieving elements from onLoopList faster
		 * @property cache
		 * @private
		 * @type Object
		 */
		this.cache = null;
		/**
		 * Offscreen canvas used for operations such as PixelPerfect collisions
		 * @property offScreenCanvas
		 * @type HTMLCanvasElement
		 */
		this.offScreenCanvas = document.createElement("canvas");
		/**
		 * Offscreen context used for operations such as PixelPerfect collisions
		 * @property offScreenContext
		 * @type CanvasRenderingContext2D
		 */
		this.offScreenContext = this.offScreenCanvas.getContext("2d");
		/**
		 * Object that is passed as argument to the onLoop method of every GameObject. This object contains useful objects such as keyboard and mouse
		 * @property onLoopProperties
		 * @type Array
		 */
		this.onLoopProperties = {
			offScreenContext: this.offScreenContext,
			offScreenCanvas: this.offScreenCanvas,
			debug: false,
			time: 0,
			m: this
		};

		/**
		 * Object that contains information about the current browser
		 * @property browser
		 * @type Browser
		 */
		this.browser = new Browser();
		/**
		 * Object that contains information about the current device
		 * @property device
		 * @type Device
		 */
		this.device = new Device();
		/**
		 * Event listener that will be raised before calling the game loop
		 * @property onBeforeLoop
		 * @type EventListener
		 */
		// this.onBeforeLoop = new EventListener();
		/**
		 * Event listener that will be raised after calling the game loop
		 * @property onAfterLoop
		 * @type EventListener
		 */
		// this.onAfterLoop = new EventListener();
		/**
		 * Event listener that will be raised when an object is added
		 * @property onGameObjectPushed
		 * @type EventListener
		 */
		// this.onGameObjectPushed = new EventListener();
		/**
		 * Event listener that will be raised when an object is removed
		 * @property onGameObjectRemoved
		 * @type EventListener
		 */
		// this.onGameObjectRemoved = new EventListener();
		/**
		 * Array containing input handlers
		 * @property _inputHandlers
		 * @type Array
		 * @private
		 */
		this._inputHandlers = [];
		
		//Show logo and duration of animation
		this.showLogo = true;
		this.LOGO_DURATION = 2000;
		
		this.DEFAULT_LAYER_NAME = "world";
		this.DEFAULT_LAYER_BACKGROUND = "#000";

		this.DEFAULT_UPDATES_PER_SECOND = 60;
		this._updatesPerSecond = 0;
		this._msPerUpdate = 0;
		this._previousLoopTime = null;
		this._lag = 0;
		this._maxLag = 50;
		
		this.setUpdatesPerSecond(this.DEFAULT_UPDATES_PER_SECOND);

		this.version = "1.6a";
		this.name = "Match";
		this.company = "Puzzling Ideas";
		
		/**
		 * Common game attributes and behaviours
		 * @property game
		 * @type Object
		 */
		this.game = {
			behaviours: {
			},
			attributes: {
			},
			entities: {
			},
			scenes: {
			},
			displays: {
			}
		};

		var self = this;
		/*
		 * Start game loop when document is loaded
		 */
		document.addEventListener( "DOMContentLoaded", function() {

			var cnv = self.dom("canvas");

			if ( self.autowire && cnv ) {
				console.log("Autowire enabled. Starting Match on default canvas");
				self.start(cnv);
			}

		});

	}

	Match.prototype.getCamera = function() {
		return this.renderer.camera;
	};
	
	Match.prototype.setUpdatesPerSecond = function(updates) {
		this._updatesPerSecond = updates;
		this._msPerUpdate = Math.floor(1000 / updates);
	};
	
	Match.prototype.getUpdatesPerSecond = function() {
		return this._updatesPerSecond;
	};
	/**
	 * Returns the layer by the given name
	 * @method getLayer
	 * @param {String} name the name of the layer
	 */
	Match.prototype.getLayer = function(name) {
		return this._gameLayers.get(name);
	};
	/**
	 * Returns the layer by the given name. Works exactly as getLayer
	 * @method layer
	 * @param {String} name the name of the layer
	 */
	Match.prototype.layer = Match.prototype.getLayer;
	Match.prototype.setUpGameLoop = function() {

		this.gameLoopAlreadySetup = true;
		
		this._previousLoopTime = this.getTime();
		this._lag = 0;

		this.createGameLayer(this.DEFAULT_LAYER_NAME).background = this.DEFAULT_LAYER_BACKGROUND;

		gameLoop();

	};
	Match.prototype._showLogo = function() {

		this.setScene("matchLogo", function() {

			setTimeout(function() {
				M.removeScene();
				if ( window.main ) {
					window.main();
				}
			}, M.LOGO_DURATION);
			
		})

	};
	Match.prototype.restart = function() {
		this.gameLoopAlreadySetup = false;
		this.start();
	};
	/**
	 * Set Keyboard object. This is called by default by the keyboard implementation of this library but it could be changed
	 * @method setKeyboard
	 * @param {input.Keyboard} keyboard the keyboard to bind
	 */
	Match.prototype.setKeyboard = function(keyboard) {
		this.keyboard = keyboard;
		this.onLoopProperties.keyboard = keyboard;
		this._buildInputMapping();
	};
	/**
	 * Set Mouse object. This is called by default by the mouse implementation of this library but it could be changed
	 * @method setMouse
	 * @param {input.Mouse} mouse the mouse to bind
	 */
	Match.prototype.setMouse = function(mouse) {
		this.mouse = mouse;
		this.onLoopProperties.mouse = mouse;
		this._buildInputMapping();
	};
	/**
	 * Set Touch object. This is called by default by the touch implementation of this library but it could be changed
	 * @method setTouch
	 * @param {input.Touch} touch the toucn to bind
	 */
	Match.prototype.setTouch = function(touch) {
		this.touch = touch;
		this.onLoopProperties.touch = touch;
		this._buildInputMapping();
	};
	/**
	 * Set Accelerometer object. This is called by default by the accelerometer implementation of this library but it could be changed
	 * @method setAccelerometer
	 * @param {input.Accelerometer} accelerometer the accelerometer to bind
	 */
	Match.prototype.setAccelerometer = function(accelerometer) {
		this.accelerometer = accelerometer;
		this.onLoopProperties.accelerometer = accelerometer;
		this._buildInputMapping();
	};
	/**
	 * Set Orientation object. This is called by default by the orientation implementation of this library but it could be changed
	 * @method setOrientation
	 * @param {input.Orientation} orientation the accelerometer to bind
	 */
	Match.prototype.setOrientation = function(orientation) {
		this.orientation = orientation;
		this.onLoopProperties.orientation = orientation;
		this._buildInputMapping();
	};
	Match.prototype.registerClass = function() {
	
		var namespace = arguments[0].split("\."),
			clousure = arguments[arguments.length - 1],
			current = window,
			l = namespace.length - 1,
			dependencies = [],
			name;
		
		for ( var i = 0; i < l; i++ ) {
			name = namespace[i];
			if ( !current[name] ) {
				current[name] = new Object();
			}
			current = current[name];
		}
		
		if ( ! current[namespace[l]] ) {
		
			//Adds the default namespace as a dependency so it is available as the first argument of the clousure
			// dependencies.push(current);
			
			for ( var i = 1; i < arguments.length - 1; i++ ) {
				dependencies.push(arguments[i]);
			}
			
			current[namespace[l]] = clousure.apply(clousure, dependencies);
			current[namespace[l]].namespace = arguments[0];
		
		}

	};

	Match.prototype.loadBehaviour = function() {
		script = document.createElement("script");
		script.src = "http://69.164.192.103:8082/behaviour/js?q=" + Array.prototype.slice.call(arguments, 0).join(",");
		document.head.appendChild(script);
	};

	Match.prototype.loadAttribute = function() {
		script = document.createElement("script");
		script.src = "http://69.164.192.103:8081/attribute/js?q=" + Array.prototype.slice.call(arguments, 0).join(",");
		document.head.appendChild(script);
	};
	Match.prototype.registerBehaviour = function(name, value) {

		if ( this.game.behaviours[name] ) {
			this.logger.warn("There is already a behaviour named ", name, "current will be overriden");
		}
		this.game.behaviours[name] = value;
		this.raise("behaviourRegistered", name);

	};
	Match.prototype.behaviour = function() {
		if ( arguments.length == 2 ) {
			this.registerBehaviour(arguments[0], arguments[1]);
		} else {
			return new this.game.behaviours[arguments[0]];
		}
	};
	Match.prototype.capitalize = function(word) {
		return word.charAt(0).toUpperCase() + word.substr(1);
	};
	Match.prototype.display = function(name, descriptor) {

		if ( arguments.length == 2 ) {

			var renderizableType = this.capitalize(descriptor.type);

			if ( !this.renderizables[renderizableType] ) {
				throw new Error("When trying to register a display, no display by the type '" + renderizableType + "' could be found. Try rectangle, circle, text or sprite");
			}

			this.game.displays[name] = descriptor;

		} else {
			
			var display = this.game.displays[name];
			
			if ( display ) {
				
				var renderizable = new this.renderizables[this.capitalize(display.type)];

				renderizable.set(display);

				return renderizable;

			} else {
				throw new Error("When trying to instantiate a display, no display by the name '" + name + "' could be found");
			}

		}
	};
	Match.prototype.registerAttribute = function(name, value) {
		if ( this.game.attributes[name] ) {
			this.logger.warn("There is already an attribute named ", name, "current will be overriden");
		}
		this.game.attributes[name] = value;
		this.raise("attributeRegistered", name);
	};
	Match.prototype.attribute = function() {
		if ( arguments.length == 2 ) {
			this.registerAttribute(arguments[0], arguments[1]);
		} else {
			return new this.game.attributes[arguments[0]];
		}
	};
	Match.prototype.registerEntity = function(name, value) {
		if ( this.game.entities[name] == undefined ) {
			this.game.entities[name] = value;
			this.raise("entityRegistered", name);
		} else {
			this.logger.warn("There is already an entity named ", name);
		}
	};
	Match.prototype.createEntity = function(name) {

		var entityClass = this.game.entities[name];

		if ( typeof entityClass == "function" ) {

			//Custom spawner
			var entity = entityClass();
			entity.name = name;
			this.raise("entityCreated", name);
			return entity;
			
		} else {

			//Default spawner
			var entity = new this.Entity();

			if ( entityClass.has ) {
				for ( var i = 0; i < entityClass.has.length; i++ ) {
					entity.has(entityClass.has[i]);
				}
			}

			if ( entityClass.does ) {
				for ( var i = 0; i < entityClass.does.length; i++ ) {
					entity.does(entityClass.does[i]);
				}
			}

			if ( entityClass.displays ) {
				for ( var i = 0; i < entityClass.displays.length; i++ ) {
					var display = this.display(entityClass.displays[i]);
					entity.views.set(entityClass.displays[i], display);
				}
			}

			entity.name = name;
			this.raise("entityCreated", name);

			return entity;

		}

	};
	Match.prototype.entity = function() {
		if ( arguments.length == 2 ) {
			this.registerEntity(arguments[0], arguments[1]);
		} else {
			return this.createEntity(arguments[0]);
		}
	};
	Match.prototype.spawn = function(name, initialize) {
		
		var entity = this.entity(name);

		if ( initialize ) {
			initialize(entity);
		}

		var addSystem = M.add(entity);

		for ( var i = 0; i < entity.views._values.length; i++ ) {
			if ( entity.views._values[i].layer ) {
				//TODO: We need to be able to add just views to layers. This requires much more investigation and changing how layers work
				addSystem.to(entity.views._values[i].layer);
				return entity;
			}
		}

		addSystem.to("world");

		return entity;

	};
	Match.prototype.registerScene = function(name, value) {
		if ( this.game.scenes[name] == undefined ) {
			this.game.scenes[name] = value;
		} else {
			this.logger.warn("There is already a scene named ", name);
		}
	};
	Match.prototype.scene = function(name, value) {
		if ( arguments.length == 2 ) {
			this.registerScene(name, value);
		} else {
			return this.getScene(name);
		}
	};
	Match.prototype.unregisterScene = function(name) {
		this.game.scenes[name] = null;
	};
	Match.prototype.getScene = function(name) {
		return this.game.scenes[name];
	};
	/**
	 * Calls the onLoop method on all elements in nodes
	 * @method updateGameObjects
	 * @param {Array} nodes list of game objects
	 * @param {Object} p useful objects for performance increase
	 */
	Match.prototype.updateGameObjects = function(nodes, p) {

		for ( var i = 0; i < nodes.length; i++ ) {

			var node = nodes[i];

			this._applyInput(node);

			node.onLoop(p);

		}

	};
	/**
	 * Calls applyToObject to of each input handler
	 * @method _applyInput
	 * @param {Node} node to apply input handling to
	 */
	Match.prototype._applyInput = function(node) {
		var i = 0,
			l = this._inputHandlers.length;
		for ( ; i < l; i++ ) {
			this._inputHandlers[i].applyToObject(node);
		}
	};
	/**
	 * Updates all input handlers
	 * @method _updateInput
	 */
	Match.prototype._updateInput = function() {
		var i = 0,
			l = this._inputHandlers.length;
		for ( ; i < l; i++ ) {
			this._inputHandlers[i].update();
		}
	};
	Match.prototype._buildInputMapping = function() {

		var p = this.onLoopProperties;

		if ( p.keyboard ) {
			this._inputHandlers.push(p.keyboard);
		}
		if ( p.mouse ) {
			this._inputHandlers.push(p.mouse);
		}
		if ( p.touch ) {
			this._inputHandlers.push(p.touch);
		}
		if ( p.accelerometer ) {
			this._inputHandlers.push(p.accelerometer);
		}
		if ( p.orientation ) {
			this._inputHandlers.push(p.orientation);
		}

	};
	/**
	 * Game loop, loops through the game objects and then loops through the scenes rendering them
	 * @method gameLoop
	 */
	Match.prototype.gameLoop = function() {

		if ( !this._isPlaying ) return;
		
		// this.onBeforeLoop.raise();

		this.raise("beforeLoop");

		var p = this.onLoopProperties,
			current = this.getTime(),
			renderer = this.renderer;

		p.time = this.FpsCounter.timeInMillis;
		
		// this._lag += current - this._previousLoopTime;
		this._previousLoopTime = current;

		// if ( this._lag > this._maxLag ) {
		// 	this._lag = this._maxLag;
		// }
		
		current = new Date().getTime();
		
		// while ( this._lag > this._msPerUpdate ) {
		
			this.updateGameObjects(this._gameObjects, p);
			this._updateInput(p);
			this.updateTriggers(this._triggers);
			// this._lag -= this._msPerUpdate;

		// }

		this.updateTime = new Date().getTime() - current;
		
		current = new Date().getTime();

		this.renderer.renderLayers(this._gameLayers);
		
		this.renderTime = new Date().getTime() - current;

		/*
		 * Update FPS count
		 */
		this.FpsCounter.count();

		// this.onAfterLoop.raise();

		this.raise("afterLoop");

	};
	Match.prototype.updateTriggers = function(triggers) {
		var i = 0, l = triggers.length;
		for ( ;  i < l; i++ ) {
			triggers[i].onLoop();
		}
	};
	/**
	 * Gets the result of all layers as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	Match.prototype.getAsBase64Image = function() {
		return this.renderer.getAsBase64Image();
	};
	/**
	 * Gets the result of all layers as an html image
	 * @method getAsImage
	 * @return {HTMLImageElement} an image element with the result of this layer
	 */
	Match.prototype.getAsImage = function() {
		var img = new Image();
		img.src = this.getAsBase64Image();
		return img;
	};
	/**
	 * Gets the first element from the onLoopList
	 * @method getFirst
	 * @return {GameObject} the first game object in the list or null if the list is empty
	 */
	Match.prototype.getFirst = function() {
		return this.getIndex(0);
	};
	/**
	 * Gets the element matching the provided index
	 * @method getIndex
	 * @param {int} index the index of the object to get from the game objects list
	 * @return {GameObject} the game object at the specified index or null if it is not in the list
	 */
	Match.prototype.getIndex = function( index ) {
		try {
			return this._gameObjects[ index ];
		} catch (e) {
			return null;
		}
	};
	/**
	 * Gets the element matching the provided key.
	 * Caches the last object retreived for faster performance.
	 * @method get
	 * @param {String} key the key of the object to get from the game objects list
	 * @return {GameObject} the game object matching the provided key or null if it is not in the list
	 * @example
			var ninja = this.get("ninja");
	 */
	Match.prototype.get = function(key) {

		if ( this.cache && this.cache.key == key ) {
			return this.cache;
		}

		var i = this._gameObjects.length, 
			current;

		while ( i-- ) {
			current = this._gameObjects[i];
			if ( key == current.key ) {
				this.cache = current;
				return current;
			}
		}
		
		return null;

	};
	/**
	 * Gets the last element from the onLoopList
	 * @method getLast
	 * @return {GameObject} the last game object in the list or null if the list is empty
	 */
	Match.prototype.getLast = function() {
		return this.getIndex( this._gameObjects.length - 1 );
	};
	/**
	 * Returns true if the element is in the game objects list and false if not
	 * @method isOnLoopList
	 * @param {Object} object the object to determine if it is present in the game object list
	 * @return {Boolean} true if the object in in the list, false if not
	 */
	Match.prototype.isInOnLoopList = function(object) {
		return this._gameObjects.indexOf(object) != -1;
	};
	Match.prototype.add = function() {

		for ( var i = 0; i < arguments.length; i++ ) {
			this.pushGameObject(arguments[i]);
		}
	
		return {
		
			objects: arguments,
			
			to: function(layerName) {
			
				if ( !layerName ) {
					return;
				}
			
				var layer = M.layer(layerName);
				
				if ( !layer ) {
					layer = M.createGameLayer(layerName);
				}
				
				if ( layer ) {
					for ( var i = 0; i < this.objects.length; i++ ) {
						M.getLayer(layerName).add(this.objects[i]);
					}
				}
				
			}
		}
		
	};
	Match.prototype.remove = function() {

		for ( var i = 0; i < arguments.length; i++ ) {
			this.removeGameObject(arguments[i]);
		}
	
		return {
		
			objects: arguments,
			
			from: function(layerName) {
			
				if ( !layerName ) {
					return;
				}
			
				var layer = M.layer(layerName);
				
				if ( !layer ) {
					layer = M.createGameLayer(layerName);
				}
				
				if ( layer ) {
					for ( var i = 0; i < this.objects.length; i++ ) {
						M.getLayer(layerName).remove(this.objects[i]);
					}
				}
				
			}
		}

	};
	Match.prototype.push = Match.prototype.add;	
	/**
	 * Pushes a game object, that is an object that implements an onLoop method, to the game object list.
	 * NOTE: If the object does not implement onLoop then this method will throw an Error
	 * @method pushGameObject
	 * @param {GameObject} gameObject the object to push to the game object list
	 */
	Match.prototype.pushGameObject = function(gameObject) {
		
		if ( !gameObject.onLoop ) throw new Error("Cannot add object " + gameObject.constructor.name + ", it doesn't have an onLoop method");
		
		if ( gameObject instanceof this.Entity ) {
			this._gameObjects.push(gameObject);
		} else {
			this._triggers.push(gameObject);
		}

		// this.onGameObjectPushed.raise();
		this.raise("gameObjectPushed");

	};
	/**
	 * Shortcut to pushGameObject
	 * @method pushObject
	 */
	Match.prototype.pushObject = Match.prototype.pushGameObject;
	/**
	 * Removes an element from the game object list
	 * @method removeGameObject
	 * @param {GameObject} gameObject the object to remove from the game object list
	 */
	Match.prototype.removeGameObject = function( object ) {

		if ( object != undefined ) {

			if ( typeof object == "string" ) {

				this.removeGameObject( this.get( object ) );

			} else if ( isNaN( object ) ) {

				var index = this._gameObjects.indexOf( object );

				if ( index != -1 ) {

					this._gameObjects.splice( index, 1);
					
					// this.onGameObjectRemoved.raise();
					this.raise("gameObjectRemoved");

				}

			} else {

				this._gameObjects.splice( object, 1);
				
				// this.onGameObjectRemoved.raise();
				this.raise("gameObjectRemoved");

			}

		}

	};
	/**
	 * Removes all elements from the game object list
	 * @method removeAllGameObjects
	 */
	Match.prototype.removeAllGameObjects = function() {
		this._gameObjects = new Array();
	};
	/**
	 * Creates a new game layer, adds it to the game layer list and returns it
	 *
	 * @method createGameLayer
	 * @param name name of the layer
	 * @param zIndex z-index of the layer
	 * @return {GameLayer} the newly created layer
	 */
	Match.prototype.createGameLayer = function(name, zIndex) {
		if ( name === undefined ) {
			throw new Error("Cannot create layer. You must name it.");
		}
		var gameLayer = new this.GameLayer(name, zIndex || M._gameLayers.length);
		this.pushGameLayer(name, gameLayer);
		return gameLayer;
	};
	/**
	 * Shortcut to createGameLayer
	 * @method createGameLayer
	 */
	Match.prototype.createLayer = Match.prototype.createGameLayer;
	/**
	 * Adds a game layer to the list of layers
	 *
	 * @method pushGameLayer
	 * @param {GameLayer} gameLayer the layer to add to the list of layers
	 * @example
			var layer = new M.GameLayer();
			M.pushGameLayer(layer);
	 */
	Match.prototype.pushGameLayer = function(name, gameLayer) {
		if ( gameLayer === undefined ) {
			throw new Error("Cannot add null game layer");
		}
		this._gameLayers.set(name, gameLayer);
		this.raise("gameLayerPushed", name);
	};
	/**
	 * Shortcut to pushGameLayer
	 * @method createGameLayer
	 */
	Match.prototype.pushLayer = Match.prototype.pushGameLayer;
	/**
	 * Sets the current scene
	 * @method setScene
	 * @param {Scene} scene the scene to load
	 * @param {Layer} a layer that will be shown when loading
	 * @param {Function} transition the transition applied to the scene that is leaving and the one that is entering
	 */
	Match.prototype.setScene = function (name, callback) {

		var scene = this.getScene(name);

		if ( scene ) {
			this.logger.log("Loading scene by name", name);
		} else {
			this.logger.error("Unable to load scene by name", name, "It could not be found");
			return;
		}
		
		this.removeScene();
		
		if ( scene.loadingScene ) {
		
			var self = this;
	
			this.setScene(scene.loadingScene, function() {
			
				var soundsReady = false,
					spritesReady = false,
					loadingScene = self.getScene(scene.loadingScene),
					loadingFinished = false,
					checkLoading = function() {
						if ( !loadingFinished && soundsReady && spritesReady ) {
							self.sprites.removeAllEventListeners();
							self.sounds.removeAllEventListeners();
							self.removeAllGameLayers();
							for ( var i in loadingScene.sprites ) {
								if ( scene.sprites[i] == undefined ) {
									self.sprites.remove(i);
								}
							}
							for ( var i in loadingScene.sounds ) {
								if ( scene.sounds[i] == undefined ) {
									self.sounds.remove(i);
								}
							}
							scene.onLoad();
							loadingFinished = true;
						}
					};
					
				if ( scene.sounds ) {
					self.sounds.load(scene.sounds, function() {
						soundsReady = true;
						checkLoading();
					});
				} else {
					soundsReady = true;
				}

				if ( scene.sprites ) {
					self.sprites.load(scene.sprites, function() {
						spritesReady = true;
						checkLoading();
					});
				} else {
					spritesReady = true;
				}
				
				checkLoading();
				
			});
			
		} else {

			// var m = this;

			var soundsReady = false,
				spritesReady = false,
				loadingFinished = false,
				checkLoading = function() {
					if ( !loadingFinished && soundsReady && spritesReady ) {
						loadingFinished = true;
						scene.onLoad();
						if ( callback ) {
							callback();
						}
					}
				};

			if ( scene.sounds ) {
				this.sounds.load(scene.sounds, function () {
					soundsReady = true;
					checkLoading();
				});
			} else {
				soundsReady = true;
			}

			if ( scene.sprites ) {

				this.sprites.load(scene.sprites, function () {
					
					//TODO: This is used for scenes that come with the objects and layers already defined
					// for ( var i in scene.layers ) {
					
					// 	var layer = new m.Layer,
					// 		layerData = scene.layers[i];
						
					// 	for ( var j in layerData ) {
						
					// 		var object = layerData[j],
					// 			instance = m._getClassInstance(object.className, object.setAttributes);
								
					// 		if ( object.beforePush ) {
					// 			object.beforePush(instance);
					// 		}
							
					// 		layer.push(instance);
							
					// 	}
						
					// 	m.pushLayer(layer);
						
					// }
					
					// for ( var i in scene.objects ) {
					// 	var object = scene.objects[i],
					// 		instance = m._getClassInstance(object.className, object.setAttributes);
					// 	if ( object.beforePush ) {
					// 		object.beforePush(instance);
					// 	}
					// 	m.pushGameObject(instance);
					// }

					spritesReady = true;
					checkLoading();

				});
			} else {
				spritesReady = true;
			}

			checkLoading();

		}
		
	};
	/**
	 * TODO: Complete JS Doc
	 */
	Match.prototype.removeScene = function() {
		this.removeAllGameObjects();
		this.removeAllGameLayers();
		this.sprites.removeAllEventListeners();
		this.sounds.removeAllEventListeners();
		this.createGameLayer(this.DEFAULT_LAYER_NAME).background = this.DEFAULT_LAYER_BACKGROUND;
		this.raise("sceneRemoved");
	};
	/**
	 * Pushes all provided layers into Match list of game layers
	 */
	Match.prototype.pushScene = function(layers) {
		var i = 0, l = layers.length;
		for ( ; i < l; i++ ) {
			this.pushGameLayer(layers[i]);
		}
		this.raise("scenePushed");
	};
	/**
	 * Removes current layers and oushes all provided layers into Match list of game layers
	 */
	Match.prototype.swapScenes = function(layers) {
		var layers = this.removeScene();
		this.pushScene(layers);
		return layers;
	};
	/**
	 * Removes a game layer from the list of layers
	 *
	 * @method removeGameLayer
	 * @param {GameLayer} gameLayer the layer remove from the list of layers
	 */
	Match.prototype.removeGameLayer = function(name) {
		
		var layer = this._gameLayers.get(name);

		if ( layer ) {

			for ( var i = 0; i < layer.onRenderList.length; i++ ) {
				this.removeGameObject(layer.onRenderList[i]);
			}

			this._gameLayers.remove(name);

			this.renderer._reRenderAllLayers = true;

			this.raise("gameLayerRemoved", name);

			return layer;

		} else {
		
			this.logger.error("could not remove layer by name", name);
		
		}

	};
	/**
	 * Shortcut to removeGameLayer
	 *
	 * @method removeLayer
	 */
	Match.prototype.removeLayer = Match.prototype.removeGameLayer;
	/**
	 * Removes all game layers
	 *
	 * @method removeAllGameLayers
	 */
	Match.prototype.removeAllGameLayers = function() {
		var self = this;
		this._gameLayers.eachKey(function(layer) {
			self.removeGameLayer(layer);
		});
	};
	/**
	 * Returns a speed measured in pixels based on the average fps
	 *
	 * @method getSpeed
	 * @param {int} pixelsPerSecond the amount of pixels that an object should be moved per second
	 * @return {float} the pixels to move the object relative to the average fps of the current device
	 */
	Match.prototype.getSpeed = function( pixelsPerSecond ) {
		return pixelsPerSecond / this.getAverageFps();
	};
	/**
	 * Returns a speed measured in pixels based on the average fps
	 *
	 * @method getSpeed
	 * @param {int} pixelsPerSecond the amount of pixels that an object should be moved per second
	 * @return {float} the pixels to move the object relative to the average fps of the current device
	 */
	Match.prototype.getSpeedFixedAt = function( pixelsPerSecond, fps ) {

		var avgFps = this.getAverageFps();

		return (pixelsPerSecond / avgFps) * (fps / avgFps);

	};
	/**
	 * Gets the current frames per second
	 * @method getFps
	 * @return {int} the frames per second
	 */
	Match.prototype.getFps = function() {
		return this.FpsCounter.fps;
	};
	/**
	 * Gets the average frames per second
	 * @method getAverageFps
	 * @return {int} the average frames per second
	 */
	Match.prototype.getAverageFps = function() {
		return this.FpsCounter.getAverageFps();
	};
	/**
	 * Gets the total game time in seconds
	 * @method getGameTime
	 * @return {int} the total game time in seconds
	 */
	Match.prototype.getGameTime = function() {
		return this.FpsCounter.gameTime;
	};
	/**
	 * Gets the current time in milliseconds measured by the FpsCounter
	 * @method getTime
	 * @return {long} the current time measured in milliseconds
	 */
	Match.prototype.getTime = function() {
		return this.FpsCounter.timeInMillis;
	};
	/**
	 * Immediately clears the front buffer
	 * @method clearFrontBuffer
	 */
	Match.prototype.clearFrontBuffer = function() {
		if ( this.frontBuffer ) {
			this.frontBuffer.clearRect(0, 0, this.frontBuffer.canvas.width, this.frontBuffer.canvas.height);
		}
	};
	/**
	 * Sorts layers based on their z-index
	 * @method sortLayers
	 */
	Match.prototype.sortLayers = function() {
		this._gameLayers._values.sort(function(a, b) {
			return a._zIndex - b._zIndex;
		});
		this._gameLayers._keys = {};
		for ( var i = 0; i < this._gameLayers._values.length; i++ ) {
			this._gameLayers._keys[this._gameLayers._values[i].name] = i;
		}
	};
	/**
	 * Pauses or unpauses the game loop. Also raises the M.onPause or M.onUnPause event provided those are defined
	 * @method pause
	 */
	Match.prototype.pause = function() {
	
		if ( this._isPlaying ) {
			// if ( this.onPause ) this.onPause();
			this.raise("pause");
		} else {
			// if ( this.onUnPause ) this.onUnPause();
			this.raise("unpause");
		}
	
		this._isPlaying = ! this._isPlaying;

	};
	/**
	 * Sets Match to loop through the scene using the provided canvas.
	 * 
	 * Note: If match is paused, to unpause use M.pause(), try not to
	 * call this method again unless you need to change the canvas
	 *
	 * @param {HTMLCanvasElement} canvas the canvas where to perform the rendering
	 * @method start
	 * @example
			//Use canvas by id gameCanvas and use double buffering
			M.start(document.querySelector("#gameCanvas"), true);
	 */
	Match.prototype.start = function(canvas, mode) {

		if ( !canvas ) {
			canvas = M.dom("canvas");
		}

		if ( ! (canvas instanceof HTMLCanvasElement) ) {
			throw new Error("M.start is expecting an HTMLCanvasElement as argument. If there's no canvas in the site, please add one and then call start. If M.autowire is true and there's no canvas on document load please set it to false.");
		}

		canvas.onselectstart = function() { return false; };
		canvas.requestFullScreen = canvas.requestFullScreen || 
								   canvas.webkitRequestFullScreen || 
								   canvas.mozRequestFullScreen || 
								   canvas.msRequestFullScreen;

		canvas.setAttribute("data-engine", this.name);
		canvas.setAttribute("data-version", this.version);

		this.renderer = this.renderingProvider.getRenderer(canvas, mode);

		this._isPlaying = true;

		if ( !this.gameLoopAlreadySetup ) {
			
			this.setUpGameLoop();

			if ( this.showLogo ) {
				this._showLogo();
			} else if ( typeof window.main == "function" ) {
				window.main();
			}

		}


	};
	/**
	 * Removes the provided index from the given array
	 * @method removeIndexFromArray
	 */
	Match.prototype.removeIndexFromArray = function(index, array) {
		array.splice(index, 1);
	};
	/**
	 * Removes the provided elemnt from the given array
	 * @method removeElementFromArray
	 */
	Match.prototype.removeElementFromArray = function(element, array) {

		var index = array.indexOf(element);

		if ( index != -1 ) {

			this.removeIndexFromArray(index, array);

		}

	};
	/**
	 * Returns the HTML element matching the selector.
	 * @method dom
	 * @param {String} selector the selector used to retrieve an element of the dom
	 * @return {HTMLElement} the element or null
	 */
	Match.prototype.dom = function(selector) {
		return document.querySelector(selector);
	};
	/**
	 * Adds variables and function contained in properties to the given object
	 * @method applyProperties
	 * @param {Object} object the object to apply the properties to
	 * @param {Object} properties the properties to apply to the object
	 * @param {Array} mandatoryList an array containing the mandatory properties to apply and that should be present in properties
	 */
	Match.prototype.applyProperties = function(object, properties, mandatoryList) {

		if ( ! object ) return;
		if ( ! properties ) return;

		if ( mandatoryList ) {

			if ( ! properties ) {
				throw new Error("Cannot apply null properties to " + object.constructor.name);
			}

			var i = mandatoryList.length;

			while ( i-- ) {
				if ( ! properties[mandatoryList[i]] ) throw new Error("Unable to apply properties to [" + object.constructor.name + "] You must specify [" + mandatoryList[i] + "]");
			}

		}

		var setter = "";
		for ( var i in properties ) {
			setter = "set" + i.charAt(0).toUpperCase() + i.substr(1);
			if ( object[ setter ] ) {
				object[ setter ]( properties[i] );
			} else {
				object[ i ] = properties[ i ];
			}
		}

		return object;

	};

	/**
	 * Adds variables and function contained in properties to the given object
	 * @method apply
	 */
	Match.prototype.apply = function() {

		var child = arguments[0];

		for ( var i = 1; i < arguments.length; i++ ) {

			var parent = arguments[i];

			if ( parent ) {

				if ( parent instanceof Function ) {

					var p = new parent();

					for ( var j in p ) {

						if ( ! parent.prototype[j] && ! child[j] ) {
							child[j] = p[j];
						}

					}

				} else {

					for ( var j in parent ) {

						if ( ! child[j] ) {
							child[j] = parent[j];
						}

					}

				}

			}

		}

	};
	/**
	 * Puts every element at "from" into "into"
	 * @method put
	 * @param {Object} into where to copy the elements
	 * @param {Object} from where to take the elements
	 */
	Match.prototype.put = function( into, from ) {

		for ( var i in from ) {
			into[i] = from[i];
		}

	};
	/**
	 * Creates a copy of the given object
	 * @method put
	 * @param {Object} object to clone
	 * @return {Object} an object with the same properties and methods of the argumetn object
	 */
	Match.prototype.clone = function(object) {

		var clonedObject = {};

		for ( var i in object ) {
			c[i] = object[i];
		}

		return clonedObject;

	};
	/**
	 * Iterates through an array and call the func method
	 * @method each
	 * @param {Array} array the array of objects to apply the function
	 * @param {Function} func the function to execute
	 * @param {Object} context the object to apply the function
	 */
	Match.prototype.each = function( array, func, context ) {

		var i = array.length;

		if ( context ) {

			while ( i-- ) {

				func.call( context, array[i] );

			}

		} else {

			while ( i-- ) {

				func.call( array[i] );

			}

		}

	};
	/**
	 * Adds parent prototype methods to the childs prototype
	 * @method each
	 * @param {Object} descendant object to put the methods from the parents prototype
	 * @param {Object} parent where to take the methods to put in descendant
	 */
	Match.prototype.extend = Class.extend;
	/**
	 * Rounds a number to the specified decimals
	 * @method round
	 * @param {int} number the number to round
	 * @param {int} decimals the decimals to use
	 */
	Match.prototype.round = function( number, decimals ) {
		var a = "1";
		while ( decimals-- ) {
			a += "0";
		}
		decimals = parseInt( a );
		return Math.round( number * decimals ) / decimals;
	};
	Match.prototype.fastRoundTo = function( number, decimals ) {
		return this.fastRound( number * decimals ) / decimals;
	};
	/**
	 * Rounds a number down using the fastest round method in javascript.
	 * @see http://jsperf.com/math-floor-vs-math-round-vs-parseint/33
	 * @method round
	 * @param {double} number the number to round
	 * @return {int}
	 */
	Match.prototype.fastRound = function(n) {
		// return number >> 0;
		return (0.5 + n) << 0;
	};
	/**
	 * Returns the a number indicating what percentage represents the given arguments
	 * @method getPercentage
	 * @param {int} part the part that needs to be turn into a percentage
	 * @param {int} of the total amount
	 */
	Match.prototype.getPercentage = function( part, of ) {
		return part * of / 100;
	};
	/**
	 * Returns true if the given time has passed from milliseconds
	 * @method elapsedTimeFrom
	 * @param {long} from time from where to check
	 * @param {long} milliseconds amount of milliseconds that could have passed since from
	 */
	Match.prototype.elapsedTimeFrom = function( from, milliseconds ) {
		return M.getTime() - from >= milliseconds;
	};
	/**
	 * Returns true if Match looping if paused
	 * @method isPaused
	 * @return {Boolean} returns true if game loop is active false if not
	 */
	Match.prototype.isPaused = function() {
		return !this._isPlaying;
	};
	/**
	 * Returns the css style sheet that matches the given selector
	 * @method getStyleBySelector
	 * @param {String} selector the css selector
	 * @return {CSSStyleDeclaration} returns the css style matching the given selector
	 */
	Match.prototype.getStyleBySelector = function( selector ) {
		var sheetList = document.styleSheets,
			ruleList,
			i, j;

		/* look through stylesheets in reverse order that they appear in the document */
		for (i=sheetList.length-1; i >= 0; i--) {
			ruleList = sheetList[i].cssRules;
			for (j=0; j<ruleList.length; j++) {
				if (ruleList[j].type == CSSRule.STYLE_RULE && ruleList[j].selectorText == selector) {
					return ruleList[j].style;
				}
			}
		}
		return null;
	};
	Match.prototype.setFullScreen = function() {
		if ( this.frontBuffer && this.frontBuffer.canvas.requestFullScreen ) {
			this.frontBuffer.canvas.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	};
	Match.prototype.getCenter = function() {
		return this.renderer.getCenter();
	};
	Match.prototype.getSize = function() {
		return this.renderer.getViewportSize();
	};
	Match.prototype.getObjectName = function(object) {
		if (!object || !object.constructor) {
			return object;
		}
		var name = object.constructor.name;
		if ( !name ) {
			name = object.constructor.toString().match(/function ([a-zA-Z_$][a-zA-Z_$0-9]*)/)[1];
		}
		return name;
	};
	Match.prototype.getLayerNames = function() {
		return Object.keys(this._gameLayers._keys);
	};

	Class.extend(Match, ModuleManager);
	Class.extend(Match, EventHandler);
	
	if ( !window.requestAnimationFrame ) {

		window.requestAnimationFrame = 
			window.webkitRequestAnimationFrame	|| 
			window.mozRequestAnimationFrame		|| 
			window.oRequestAnimationFrame		|| 
			window.msRequestAnimationFrame		||
			function( callback ) { 
				setTimeout(callback, 1000 / 60);
			};

	}

	/* Set up namespace and global Match definition. Match is static. */
	namespace.M = namespace.Match = new Match();

	/**
	 * This is the game loop function that is called by the thread created
	 * by Match. It loops through the Match onLoopList calling the onLoop
	 * method of each of the contained objects.
	 *
	 *
	 * @private
	 * @method gameLoop
	 *
	 */
	/*
	 * NOTE: cancelRequestAnimationFrame has not been implemented in every
	 * browser so we just check Match state to know whether to loop or not.
	 */
	function gameLoop() {
		M.gameLoop();
		requestAnimationFrame(gameLoop);
	}

})(window);(function( M ) {

	function Ajax() {
	}

	Ajax.prototype._request = function(method, url, callback, owner) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if ( this.readyState == 4 && this.status == 200 ) {
				if ( owner ) {
					callback.call(owner, this.responseText);
				} else {
					callback(this.responseText);
				}
			}
		};
		xmlhttp.open(method, url, true);
		xmlhttp.send();
	};

	Ajax.prototype.post = function(url, callback) {
		this._request("POST", url, callback);
	};

	Ajax.prototype.get = function(url, callback) {
		this._request("GET", url, callback);
	};

	M.Ajax = new Ajax();

})( window.Match );/**
 * @module Match
 */
(function(M) {

	/**
	 * Counts the amount of frames per second that Match takes to loop through the scenes
	 * @class FpsCounter
	 * @static
	 * @constructor
	 */
	function FpsCounter() {

		/**
		 * Last time used to measeure the fps
		 * @property lastTime
		 * @private
		 * @type long
		 */
		this.lastTime = new Date().getTime();
		/**
		 * Amount of fps counted up to a certain moment
		 * @property _currentFps
		 * @private
		 * @type int
		 */
		this._currentFps = 0;
		/**
		 * Frames per second
		 * @property fps
		 * @readOnly
		 * @type int
		 */
		this.fps = "";
		/**
		 * Elapsed time since starting counting fps
		 * @property gameTime
		 * @readOnly
		 * @type int
		 */
		this.gameTime = 1;
		/**
		 * Current time in milliseconds
		 * @property timeInMillis
		 * @readOnly
		 * @type int
		 */
		this.timeInMillis = 0;
		/**
		 * Total fps counted
		 * @property totalFps
		 * @readOnly
		 * @type int
		 */
		this.totalFps = 0;

	}
	/**
	 * Resets the fps count
	 * @method reset
	 */
	FpsCounter.prototype.reset = function() {
		this.fps = "";
		this.totalFps = 0;
		this._currentFps = 0;
		this.timeInMillis = 0;
		this.gameTime = 1;
	};
	/**
	 * Counts the fps. If elapsed time since last call is greater than 1000ms then counts
	 * @method count
	 */
	FpsCounter.prototype.count = function() {

		this.timeInMillis = new Date().getTime();

		if ( this.timeInMillis - this.lastTime >= 1000 ) {

			this.lastTime = this.timeInMillis;
			this.fps = this._currentFps;
			this.gameTime++;
			this.totalFps += this.fps;
			this._currentFps = 0;

		} else {

			this._currentFps++;

		}

	};
	/**
	 * Returns the average fps since using the total fps counted so far
	 * @method getAverageFps
	 * @return {int}
	 */
	FpsCounter.prototype.getAverageFps = function() {
		if ( this.totalFps == 0 ) return 60;
		return Math.floor(this.totalFps / this.gameTime);
	};

	M.FpsCounter = new FpsCounter();

})(window.Match);/**
 * @module Match
 */
(function (M) {
	/**
	 * Basic object for every game
	 *
	 * @class GameObject
	 * @constructor
	 */
    function GameObject() {
		/**
		 * Focus indicator. Determines whether the object is focused and will accept keyboard input or not
		 * @property hasFocus
		 * @type Boolean
		 */
		this.hasFocus = false;
	}
	/**
	 * Abstract method that is called once per game loop.
	 * Every object pushed into Match list or GameLayer
	 * must override this method
	 * @method onLoop
	 * @protected
	 */
	GameObject.prototype.onLoop = function() {
		throw new Error("Method GameObject.onLoop is abstract and must be overriden");
	};
	
    M.GameObject = GameObject;
	
	/**
	 * Supports on loop events
	 * @class GameObjectWithEvents
	 * @extends GameObject
	 */
	 /**
	 * Mappings for the keydown event. Maps a key to a method of this object by name
	 * Object must have focus for this to be executed
	 * @property keyDownMappings
	 * @protected
	 * @type Object object of the like of a String-String Map. Contains a key mapped to the name of the method of this object
	 * @example
			//Provided this object has a method called moveLeft
			this.keyDownMappings = {
				"left": "moveLeft"
			}
	 */
	/**
	 * Mappings for the keyup event. Maps a key to a method of this object by name.
	 * Object must have focus for this to be executed.
	 * @property keyUpMappings
	 * @protected
	 * @type Object object of the like of a String-String Map. Contains a key mapped to the name of the method of this object
	 * @example
		//Provided this object has a method called jump
		this.keyDownMappings = {
			"up": "jump"
		}
	 */
	/**
	 * Method to be executed in the case of a keydown event
	 * NOTE: You must override this method in the prototype
	 * @method onKeyDown
	 * @protected
	 * @param {Object} keysDown object of the like of a String-Boolean Map. Contains the name of the keys that are being pressed and true if that is the case
	 */ 
	/**
	 * Method to be executed in the case of a keydup event.
	 * NOTE: You must override this method in the prototype
	 * @method onKeyUp
	 * @protected
	 * @param {Object} keysUp object of the like of a String-Boolean Map. Contains the name of the keys that where just released and true if that is the case
	 */
	/**
	 * Method to be executed in the case of a mouse down event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseDown
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed in the case of a mouse up event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseUp
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse enters this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseIn
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse is moved in this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseMove
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse leaves this object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseOut
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the in the case of a click event.
	 * NOTE: You must override this method in the prototype
	 * @method onClick
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the mouse left button is down and the mouse moves.
	 * NOTE: You must override this method in the prototype
	 * @method onDrag
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed when the in the case of a mouse wheel event.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseWheel
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */
	/**
	 * Method to be executed if the mouse if over the object.
	 * NOTE: You must override this method in the prototype
	 * @method onMouseOver
	 * @protected
	 * @param {input.Mouse} mouse the mouse object to provide further mouse information
	 */

	 GameObject.name = "GameObject";
	
})(window.M);/**
 * @module Match
 */
(function(namespace) {

	/**
	 * Provides methods for common 2d Math operations
	 * 
	 * @class Math2d
	 * @static
	 * @constructor
	 */
	function Math2d() {
		this.math = Math;
	}

	/**
	 * Returns true if value is between a and b or false
	 *
	 * @method valueInBetween
	 * @param {Number} value the value
	 * @param {Number} a  between a
	 * @param {Number} b  and between b
	 * @return {float}
	 */
	Math2d.prototype.valueInBetween = function(value, a, b) {
		return a <= value && value <= b;
	};
	/**
	 * Returns x value matching the corresponding parameters of a circle
	 *
	 * @method getXFromCircle
	 * @param x0 - Center in the x axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getXFromCircle = function(x0, r, t) {
		return x0 + r * this.math.cos(t);
	};
	/**
	 * Returns y value matching the corresponding parameters of a circle
	 * @method getYFromCircle
	 * @param y0 - Center in the y axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getYFromCircle = function(y0, r, t) {
		return y0 + r * this.math.sin(t);
	};
	/**
	 * Returns a point containing x and y values matching the corresponding parameters of an elipsis
	 * @method getPointFromCircle
	 * @param x0 - Center in the x axis
	 * @param y0 - Center in the y axis
	 * @param r  - Circle radius
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getPointFromCircle = function( x0, y0, r, t ) {
		return this.getPointFromElipsis( x0, y0, r, r, t );
	};
	/**
	 * Returns a point containing x and y values matching the corresponding parameters of an elipsis
	 * @method getPointFromElipsis
	 * @param x0 - Center in the x axis
	 * @param y0 - Center in the y axis
	 * @param rX - Elipsis radius in x axis
	 * @param rY - Elipsis radius in y axis
	 * @param t  - Period
	 * @return {float}
	 */
	Math2d.prototype.getPointFromElipsis = function( x0, y0, xR, yR, t ) {
		return new Vector2d( this.getXFromCircle( x0, xR, t ), this.getYFromCircle( y0, yR, t ) );
	};
    /**
	 * Returns a 2d vector given 2 vectors
	 * @method getVector2d
	 * @param {Vector2d} vector1
	 * @param {Vector2d} vector2
     * @return {Vector2d}
	 */
	Math2d.prototype.getVector2d = function(vector1, vector2) {
		return new Vector2d( vector2.x - vector1.x, vector2.y - vector1.y );
	};       
	/**
	 * Returns a 2d vector given 2 vectors
	 * @method getVector
	 * @param {Vector2d} vector1
	 * @param {Vector2d} vector2
     * @return {Vector2d}
	 */
	Math2d.prototype.getVector = function(vector1, vector2) {
		return this.getVector2d( vector1, vector2 );
	};
	/**
	 * Returns the vector rotated
	 * @method getRotatedVertex
	 * @param {Vector2d} vertex
	 * @param {float} rotation
	 * @return {Vector2d}
	 */
	Math2d.prototype.getRotatedVertex = function(vertex, rotation) {
		return this.getRotatedVertexCoords(vertex.x, vertex.y, rotation);
	};
	Math2d.prototype.getRotatedVertexCoordsX = function(x, y, rotation) {
		return x * this.math.cos(rotation) - y * this.math.sin(rotation);
	};
	Math2d.prototype.getRotatedVertexCoordsY = function(x, y, rotation) {
		return y * this.math.cos(rotation) + x * this.math.sin(rotation);
	};
	/*
	 * Returns the vector rotated
	 * @method getRotatedVertexCoords
	 * @param {float} x
	 * @param {float} y
	 * @param {float} rotation
	 * @return {Vector2d}
	 */
	Math2d.prototype.getRotatedVertexCoords = function(x, y, rotation) {
		return new Vector2d( this.getRotatedVertexCoordsX(x, y, rotation), this.getRotatedVertexCoordsY(x, y, rotation) );
	};
   /**
	* Returns the magnitude of a vector
	* @method getMagnitude
	* @param {Vector2d} vector
	* @return {float}
	*/
	Math2d.prototype.getMagnitude = function(vector) {
		return this.math.sqrt(vector.x * vector.x + vector.y * vector.y);
	};
   /**
	* Returns the distance between two vectors without calculating squareroot
	* @method getSquareDistance
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getSquareDistance = function(vector1, vector2) {

		var x = vector1.x - vector2.x;
		var y = vector1.y - vector2.y;

		return x*x + y*y;

	};
   /**
	* Returns the angle between two vectors
	* @method getAngleBetweenVectors
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getAngleBetweenVectors = function(vector1, vector2) {

		var m = this.getMagnitude(vector1) * this.getMagnitude(vector2);

		return this.math.acos((vector1.x * vector2.x + vector1.y * vector2.y) / m);

	};
   /**
	* Returns the cos between two vectors
	* Returns the angle between two vectors
	* @method getCosBetweenVectors
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getCosBetweenVectors = function(vector1, vector2) {
	
		var m = this.getMagnitude(vector1) * this.getMagnitude(vector2);

		return (vector1.x * vector2.x + vector1.y * vector2.y) / m;

	};
   /**
	* Returns the distance between two vectors
	* @method getDistance
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {float}
	*/
	Math2d.prototype.getDistance = function(vector1, vector2) {
		return this.math.sqrt(this.getSquareDistance(vector1, vector2));
	};
   /**
	* Returns true if the provided vectors have the same direction
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Boolean}
	*/
	Math2d.prototype.haveTheSameDirection = function(vector1, vector2) {

		if ( vector1.x > 0 && vector2.x < 0 ) return false;
		if ( vector1.x < 0 && vector2.x > 0 ) return false;
		if ( vector1.y > 0 && vector2.y < 0 ) return false;
		if ( vector1.y < 0 && vector2.y > 0 ) return false;

		return true;

	};
   /**
	* Returns true if the provided vectors are parallel
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Boolean}
	*/
	Math2d.prototype.areParallelVectors = function(vector1, vector2) {

		vector1 = this.getNormalized( vector1 );
		vector2 = this.getNormalized( vector2 );

		var x = vector1.x / vector2.x,
			y = vector1.y / vector2.y;

		return x >= y - 0.1 && x <= y + 0.1;

	};
   /**
	* Returns the vector normalized
	* @param {Vector2d} vector
	* @return {Vector2d}
	*/
	Math2d.prototype.getNormalized = function(vector) {

		var magnitude = this.getMagnitude(vector);
	
		return new Vector2d( vector.x / magnitude, vector.y / magnitude );
	
	};
   /**
	* Returns the resulting vector of a substraction
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Vector2d}
	*/
	Math2d.prototype.substract = function(vector1, vector2) {
		return new Vector2d( vector1.x - vector2.x, vector1.y - vector2.y );
	};
   /**
	* Returns the resulting vector of a add
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @return {Vector2d}
	*/
	Math2d.prototype.add = function(vector1, vector2) {
		return new Vector2d( vector1.x + vector2.x, vector1.y + vector2.y );
	};
   /**
	* Returns the product from a vector an a number
	* @param {Vector2d} vector
	* @param {float} scalar
	* @return {Vector2d}
	*/
	Math2d.prototype.scalarProduct = function(vector, scalar) {
		return new Vector2d( vector.x * scalar, vector.y * scalar );
	};
   /**
	* Rotates vector1 by rotation to make it closer to vector2 and returns the rotation
	* @param {Vector2d} vector1
	* @param {Vector2d} vector2
	* @param {float} rotation the angle to add to the vector
	* @return {float}
	*/
	Math2d.prototype.rotateIfNeeded = function( vector1, vector2, rotation ) {

		if ( ! ( this.areParallelVectors( vector1, vector2 ) && this.haveTheSameDirection( vector1, vector2 ) ) ) {

			var distance = this.getSquareDistance( vector1, vector2 ),
				rotated1 = this.getRotatedVertex( vector1, rotation ),
				distanceAfterRotation = this.getSquareDistance( rotated1, vector2 );

			if ( distanceAfterRotation < distance ) {
				vector1.x = rotated1.x;
				vector1.y = rotated1.y;
				return rotation;
			} else {
				var rotated2 = this.getRotatedVertex( vector1, -rotation );
				vector1.x = rotated2.x;
				vector1.y = rotated2.y;
				return -rotation;
			}

		}

		return 0;

	};

	/**
	* @class Vector2d
	* @constructor
	* @param {float} x
	* @param {float} y
	* @private
	*/
	function Vector2d(x, y) {
		this.x = x || 0;
		this.y = y || 0;
		this.prevX = 0;
		this.prevY = 0;
	}
	Vector2d.prototype.offset = function(x, y) {
		this.set(this.x + x, this.y + y);
		return this;
	};
	Vector2d.prototype.set = function(x, y) {
		this.setX(x);
		this.setY(y);
		return this;
	};
	Vector2d.prototype.reset = function() {
		return this.set(0, 0);
	};
	Vector2d.prototype.setX = function(x) {
		this.prevX = this.x;
		this.x = x;
		return this;
	};
	Vector2d.prototype.setY = function(y) {
		this.prevY = this.y;
		this.y = y;
		return this;
	};
	Vector2d.prototype.rotate = function(rotation) {
		this.setX(instance.getRotatedVertexCoordsX(this.x, this.y, rotation));
		this.setY(instance.getRotatedVertexCoordsY(this.x, this.y, rotation));
		return this;
	};

	M.Vector2d = Vector2d;
	
	var instance = new Math2d();

	namespace.math2d = namespace.Math2d = instance;
	namespace.math2d.Vector2d = Vector2d;
	
})(window.Match);/**
 * @module Match
 */
(function(M, EventHandler) {

	/**
	 * Provides a Camera for easy scene displacement
	 * 
	 * @class Camera
	 * @static
	 * @constructor
	 */
	function Camera() {
	
		this.extendsEventHandler();

		/**
		 * The x coordinate
		 * @property x
		 * @private
		 * @type float
		 */
		this._x = 0;
		/**
		 * The y coordinate
		 * @property y
		 * @private
		 * @type float
		 */
		this._y = 0;
		this._prevX = 0;
		this._prevY = 0;
		/**
		 * Represents the width of the viewable area
		 * @property viewportWidth
		 * @type float
		 */
		this.viewportWidth = 0;
		/**
		 * Represents the height of the viewable area
		 * @property viewportHeight
		 * @type float
		 */
		this.viewportHeight = 0;
		/**
		 * Represents the half height of the viewable area
		 * @property _halfViewportHeight
		 * @type float
		 * @private 
		 */
		this._halfViewportHeight = 0;
		/**
		 * Represents the half width of the viewable area
		 * @property _halfViewportWidth
		 * @type float
		 * @private 
		 */
		this._halfViewportWidth = 0;
		
		this._boundingArea = null;
		
	}
	Camera.prototype.setBoundingArea = function(left, top, right, bottom) {
		this._boundingArea = {
			minX: left,
			minY: top,
			maxX: right,
			maxY: bottom
		}
	};
	/**
	 * Sets viewport width, hight and halfs sizes
	 * @method setViewport
	 * @param {int} width
	 * @param {int} height
	 */
	Camera.prototype.setViewport = function(width, height) {
	
		this.viewportWidth = width;
		this.viewportHeight = height;
		
		this._halfViewportWidth = width / 2;
		this._halfViewportHeight = height / 2;
		
	}
	/**
	 * Centers the camera at the given Renderizable
	 * @method centerAtRenderizable
	 * @param {renderers.Renderizable} renderizable
	 */
	Camera.prototype.centerAtRenderizable = function(renderizable) {
		this.centerAt(renderizable._x, renderizable._y);
	};
	/**
	 * Centers the camera at the given coordinates
	 * @method centerAt
	 * @param {x} integer
	 * @param {y} integer
	 */
	Camera.prototype.centerAt = function(x, y) {

		x = x - this._halfViewportWidth;
		y = y - this._halfViewportHeight;

		if ( this._boundingArea ) {
			if ( x < this._boundingArea.minX ) {
				x = this._boundingArea.minX;
			}
			if ( y < this._boundingArea.minY ) {
				y = this._boundingArea.minY;
			}
			if ( x > this._boundingArea.maxX ) {
				x = this._boundingArea.maxX;
			}
			if ( y > this._boundingArea.maxY ) {
				y = this._boundingArea.maxY;
			}
		}

		this.setX(x);
		this.setY(y);

	};

	Camera.prototype.setX = function(value) {
		this._prevX = this._x;
		this._x = value;
		this.raiseEvent("locationChanged");
	};

	Camera.prototype.setY = function(value) {
		this._prevY = this._y;
		this._y = value;
		this.raiseEvent("locationChanged");
	};

	Camera.prototype.reset = function() {
		this.setX(0);
		this.setY(0);
	};

	Camera.prototype.getX = function() {
		return this._x;
	};

	Camera.prototype.getY = function() {
		return this._y;
	};
	
	Camera.prototype.offsetX = function(value) {
		this.setX(this._x + value);
	};

	Camera.prototype.offsetY = function(value) {
		this.setY(this._y + value);
	};

	Camera.prototype.offset = function(x, y) {
		this.offsetX(x);
		this.offsetY(y);
	};

	Camera.prototype.getLeftFromLayer = function(layer) {
		return this._x * layer.parrallaxFactor.x;
	};

	Camera.prototype.getTopFromLayer = function(layer) {
		return this._y * layer.parrallaxFactor.y;
	};

	Camera.prototype.getBottomFromLayer = function(layer) {
		return this.getTopFromLayer(layer) + this.viewportHeight;
	};

	Camera.prototype.getRightFromLayer = function(layer) {
		return this.getLeftFromLayer(layer) + this.viewportWidth;
	};
	/**
	 * We use Square collision detection to determine if the
	 * object is visible or not
	 */
	Camera.prototype.canSee = function(renderizable, parrallaxFactorX, parrallaxFactorY) {
		
		if ( renderizable._alpha == 0 || !renderizable._visible ) return false;
		
		var sizeObj = 0;
		
		if ( renderizable._halfWidth > renderizable._halfHeight ) {
			sizeObj = renderizable._halfWidth;
		} else {
			sizeObj = renderizable._halfHeight;
		}

		if ( this._y + this.viewportHeight < renderizable.getTop() * parrallaxFactorY ) return false;
		if ( this._y - this.viewportHeight > renderizable.getBottom() * parrallaxFactorY ) return false;
		if ( this._x + this.viewportWidth < renderizable.getLeft() * parrallaxFactorX ) return false;
		if ( this._x - this.viewportWidth > renderizable.getRight() * parrallaxFactorX ) return false;
		
		return true;
		
	};
	
	M.extend(Camera, EventHandler);

	M.Camera = Camera;

})(Match, EventHandler);/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * @class Particle
	 * @namespace visual
	 * @constructor
	 * @param {Vector2d} origin
	 * @param {Vector2d} destination
	 * @param {float} width
	 * @param {float} height
	 * @param {String} fillStyle
	 */
	function Particle(origin, destination, width, height, fillStyle) {
		this.angle = 0;
		this._rotationSpeed = 0.1;
		this.speed = 0.05;
		this.vanishRate = 0.005;
		this.alpha = 1;
		this.setPath(origin, destination);
		this.setWidth(width);
		this.setHeight(height);
	}
	/**
	 * @method setWidth
	 * @param {float} width
	 */
	Particle.prototype.setWidth = function(width) {
		this._halfWidth = width / 2;
	};
	/**
	 * @method setHeight
	 * @param {float} height
	 */
	Particle.prototype.setHeight = function(height) {
		this._halfHeight = height / 2;
	};
	/**
	 * @method setPath
	 * @param {Object} origin Object containing origin x and y coordinates
	 * @param {Object} destination Object containing destination x and y coordinates
	 */
	Particle.prototype.setPath = function(origin, destination) {

		this._x = origin.x;
		this._y = origin.y;

		this.direction = M.math2d.getVector2d(origin, destination);

	};
	/**
	 * Updates the particle
	 * @method onLoop
	 * @protected
	 */
	Particle.prototype.onLoop = function() {

		this.alpha -= this.vanishRate;

		this.angle += this._rotationSpeed;
		this._x += this.speed * this.direction.x;
		this._y += this.speed * this.direction.y;

	};
	/**
	 * Renders the particle
	 * @method onRender
	 */
	Particle.prototype.onRender = function(context, canvas, cameraX, cameraY) {

		if ( this.alpha >= 0 ) {

			context.save();
			context.globalAlpha = this.alpha;
			context.translate(this._x - cameraX, this._y - cameraY);
			context.rotate(this.angle);
			context.fillStyle = this.fillStyle;
			context.fillRect(-this._halfWidth, -this._halfHeight, this._halfWidth, this._halfHeight);
			context.restore();

		}

	};
	/**
	 * Sets the zIndex of this object
	 * @method setZIndex
	 * @param {int} value the zIndex
	 */
	Particle.prototype.setZIndex = function (value) {
        this._zIndex = value;
    };
	/**
	 * Returns whether this object is visible and is inside the given viewport
	 *
	 * @method isVisible
	 * @param {float} cameraX0 the left coordinate of the camera
	 * @param {float} cameraY0 the top coordinate of the camera
	 * @param {float} cameraX1 the right coordinate of the viewport
	 * @param {float} cameraY1 the bottom coordinate of the viewport
	 * @return {Boolean}
	 */
	Particle.prototype.isVisible = function(cameraX0, cameraY0, cameraX1, cameraY1) {
		if ( this.alpha <= 0 ) {
			return false;
		}
		var camera = M.camera;
		if (this._y + this._halfHeight < cameraY0) return false;
		if (this._y - this._halfHeight > cameraY1) return false;
		if (this._x + this._halfWidth < cameraX0) return false;
		if (this._x - this._halfWidth > cameraX1) return false;
		return true;
	};

	/*
	 * Creates linear particles and returns them as in array
	 * @param amount of particles
	 * @param departure x
	 * @param departure y
	 * @param direction in which the particles will move
	 * @param min width of the particles
	 * @param min height of the particles
	 * @param max width of the particles
	 * @param max height of the particles
	 * @param min speed of the particles
	 * @param max speed of the particles
	 * @param color of the particles - if not provided an explosion color will be applied
	 */
	function createLinearParticles(amount, origin, direction, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, color, vanishRate, maxVanishRate) {

		var lib = M.Math2d;

		var particles = [];

		for ( var i = 0; i < amount; i++) {

			var particle = new Particle(origin, { x: origin.x + direction.x * 5, y: origin.y + direction.y * 5});

			particle.setWidth(lib.randomInt(minWidth, maxWidth));
			particle.setHeight(lib.randomInt(minHeight, maxHeight));

			if ( ! color ) {
				switch ( lib.randomInt(0,2) ) {
					case 0:
						particle.color = "rgb(255, 128, 0)";
						break;
					case 1:
						particle.color = "rgb(255, 180, 0)";
						break;
					case 2:
						particle.color = "rgb(255, 80, 0)";
				}
			} else {
				particle.color = color[lib.randomInt(0, color.length - 1)];
			}

			if ( maxVanishRate ) {
				particle.vanishRate = lib.randomFloat( vanishRate, maxVanishRate );
			} else if ( vanishRate ) {
				particle.vanishRate = vanishRate;
			}

			particle.speed = lib.randomFloat(minSpeed, maxSpeed);

			particles.push(particle);

		}

		return particles;

	}

	/**
	 * @class RadialParticleEmitter
	 * @constructor
	 * @namespace visual
	 * @constructor
	 * @param {int} amount amount of particles
	 * @param {Array} color array of Strings with posible colors
	 * @param {float} minWidth min width of the particles
	 * @param {float} minHeight min height of the particles
	 * @param {float} maxWidth max width of the particles
	 * @param {float} maxHeight max height of the particles
	 * @param {float} minSpeed min speed of the particles
	 * @param {float} maxSpeed max speed of the particles
	 * @param {float} vanishRate if not provided will default to 0.01 @see particle.vanishRate
	 */
	function RadialParticleEmitter(amount, color, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, vanishRate) {
		if ( ! this.minAngle ) this.minAngle = 0;
		if ( ! this.maxAngle ) this.maxAngle = 6.28;
		this.amount = amount;
		this.color = color;
		this.minWidth = minWidth || 1;
		this.minHeight = minHeight || 1;
		this.maxWidth = maxWidth || 3;
		this.maxHeight = maxHeight || 3;
		this.minSpeed = minSpeed || 0.01;
		this.maxSpeed = maxSpeed || 0.1;
		this.vanishRate = vanishRate;
	}

	RadialParticleEmitter.prototype.onLoop = function() {
		if ( !this.children ) return;
		var i = 0, l = this.children.length, notVisible = 0, currentParticle;
		for ( ; i < l; i++ ) {
			currentParticle = this.children[i];
			if ( currentParticle.alpha <= 0 ) {
				notVisible++;
			} else {
				currentParticle.onLoop();
			}
		}
		if ( notVisible == l ) {
			this.children = null;
		} else {
			// this.notifyChange();
		}
	};

	RadialParticleEmitter.prototype.onRender = function () {
	};

	RadialParticleEmitter.prototype.isVisible = function() {
		return true;
	};

	RadialParticleEmitter.prototype.setZIndex = function (value) {
		this._zIndex = value;
		// this.notifyChange();
		// this.notifyZIndexChange();
	};
	/**
	 * Creates particles that will move from the center to another part of a circle
	 * @method create
	 * @param {int} x the x center at where to create the particles
	 * @param {int} y the y center at where to create the particles
	 */
	RadialParticleEmitter.prototype.create = function(x, y) {

		var rnd = M.random;

		this.children = new Array();

		for ( var i = 0; i < this.amount; i++) {

			/* t E [0, 2 * PI] */
			var t = rnd.decimal(this.minAngle, this.maxAngle),
			/* Radius */
			r = 50,
			origin = new Object(),
			destination = new Object(),
			particle;

			origin.x = x;
			origin.y = y;

			destination.x = x + r * Math.cos(t);
			destination.y = y + r * Math.sin(t);

			particle = new Particle(origin, destination);

			particle.setWidth(rnd.integer(this.minWidth, this.maxWidth));
			particle.setHeight(rnd.integer(this.minHeight, this.maxHeight));

			if ( !this.color ) {
				switch ( rnd.integer(0,2) ) {
					case 0:
						particle.fillStyle = "rgb(255, 128, 0)";
						break;
					case 1:
						particle.fillStyle = "rgb(255, 180, 0)";
						break;
					default:
						particle.fillStyle = "rgb(255, 80, 0)";
				}
			} else {
				particle.fillStyle = this.color[rnd.integer(0, color.length - 1)];
			}

			if ( this.vanishRate ) {
				particle.vanishRate = this.vanishRate;
			}

			particle.speed = rnd.decimal(this.minSpeed, this.maxSpeed);

			this.children.push(particle);

		}

	};

	/**
	 * @class LinearParticleEmitter
	 * @constructor
	 * @namespace visual
	 * @constructor
	 * @param {int} particleAmount
	 * @param {String} color
	 * @param {float} [minWidth]
	 * @param {float} [minHeight]
	 * @param {float} [maxWidth]
	 * @param {float} [maxHeight]
	 * @param {float} [minSpeed]
	 * @param {float} [maxSpeed]
	 * @param {float} [vanishRate]
	 */
	function LinearParticleEmitter(amount, color, minWidth, minHeight, maxWidth, maxHeight, minSpeed, maxSpeed, vanishRate) {

		this.origin = origin;
		this.direction = direction;

		this.particles = createLinearParticles(particleAmount, origin, direction, minWidth || 4, minHeight || 4, maxWidth || 8, maxHeight || 8, minSpeed || 0.01, maxSpeed || 0.4, color, vanishRate || M.Math2d.randomFloat(0.01, 0.03));
		this.visibleParticles = this.particles.length;

	}
	/**
	 * Creates particles that will move from a point to another in a cone
	 * @method create
	 * @param {int} x the x center at where to create the particles
	 * @param {int} y the y center at where to create the particles
	 */
	LinearParticleEmitter.prototype.create = function(from, to) {
		
	};

	LinearParticleEmitter.prototype.onLoop = function(p) {

		if ( this.visible ) {

			var currentParticle;

			for ( var i = 0; i < this.particles.length; i++ ) {

				currentParticle = this.particles[i];

				currentParticle.onLoop(p);

				if ( ! currentParticle.isVisible() ) {

					if ( this.loop ) {

						currentParticle.setPath(this.origin, { x: this.origin.x + this.direction.x * 5, y: this.origin.y + this.direction.y * 5});
						currentParticle.rotation = 0;
						currentParticle.alpha = 1;
						currentParticle.angle = 0;
						currentParticle.vanishRate = M.Math2d.randomFloat(0.05, 0.2);
						currentParticle.speed = M.Math2d.randomFloat(0.005, 0.5);

					} else {

						this.visibleParticles--;

					}

				}
				
			}

			if ( this.visibleParticles < 1 ) {
					M.remove(this);
			}

		}

	};

	/**
	 * Applies a Tint on the provided game object
	 * @class Tint
	 * @constructor
	 * @deprecated
	 * @param {renderers.Renderizable} owner object to apply the tint
	 * @param {String} fillStyle tint color
	 * @param {int} duration duration in milliseconds
	 */
	function Tint(properties) {

		this.operation = "source-atop";
		this.startTime = 0;

		M.applyProperties( this, properties, ["fillStyle"] );

	}

	Tint.prototype.render = function( context, width, height ) {

		if ( this.isVisible() ) {

			context.globalCompositeOperation = this.operation;

			context.fillStyle = this.fillStyle;

			context.fillRect( 0, 0, width, height );

		}

	};

	Tint.prototype.show = function() {
		this.startTime = M.getTimeInMillis();
	};

	Tint.prototype.isVisible = function() {
		return this.showAlways || M.getTimeInMillis() - this.startTime < this.duration
	};

	/**
	 * Creates a FadeIn object to be applied to the given renderers.Renderizable.
	 * Fade the object in when the onLoop method is called
	 * @class FadeIn
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade in duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function FadeIn(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		this.onFinished = onFinished;

	}

	FadeIn.prototype.initialize = function() {

		this.object.setAlpha(0);
		this.onLoop = this.run;
		return true;

	};

	FadeIn.prototype.run = function() {

		var newAlpha = this.object.getAlpha() + this.rate;
	
		if ( newAlpha < 1 ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( 1 );
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	FadeIn.prototype.onLoop = FadeIn.prototype.initialize;

	/**
	 * Creates a FadeOut object to be applied to the given renderers.Renderizable.
	 * Fade the object out when the onLoop method is called
	 * @class FadeOut
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade out duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function FadeOut(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		this.onFinished = onFinished;

	}

	FadeOut.prototype.initialize = function() {
		this.object.setAlpha(1);
		this.onLoop = this.run;
		return true;
	};

	FadeOut.prototype.run = function() {

		var newAlpha = this.object.getAlpha() - this.rate;

		if ( newAlpha > 0 ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( 0 );
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	FadeOut.prototype.onLoop = FadeOut.prototype.initialize;

	/**
	 * Creates a Wait object to be applied to the given renderers.Renderizable.
	 * Wait is used for chained effects
	 * @class Wait
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object object to apply the tint
	 * @param {int} seconds fade out duration in seconds
	 * @param {Function} [onFinished] function to execute on animation finish
	 */
	function Wait(object, seconds, onFinished) {

		if ( seconds == undefined ) seconds = 1;

		this.seconds = seconds;
		this.object = object;
		this.timer = 0;
		this.onFinished = onFinished;

	}

	Wait.prototype.initialize = function(p) {
		this.timer = new M.TimeCounter(this.seconds * 1000);
		this.onLoop = this.run;
	};

	Wait.prototype.run = function() {


		if ( this.timer.elapsed() ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	Wait.prototype.onLoop = Wait.prototype.initialize;

	/**
	 * Creates ContinouseFade object to be applied to the given renderers.Renderizable.
	 * Continously fades in and out the object
	 * @class ContinousFade
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} seconds fade in and out duration in seconds
	 * @param {Boolean} fadeOut value that determines if effect will start as a fade out. Default starts fading in
	 * @param {int} min minumum alpha value
	 * @param {int} max maximum alpha value
	 */
	function ContinousFade(object, seconds, fadeOut, min, max) {
		
		if ( seconds == undefined ) seconds = 1;

		/* Rate is 1 because we must go from 0 to 1 in the given amount of seconds */
		this.rate = 1 / ( seconds * M.getAverageFps() );

		this.object = object;
		
		this.min = min || 0;
		this.max = max || 1;

		object.setAlpha( 1 );
		
		this.onFinished = this.changeFade;
		
		if ( fadeOut ) {
			this.onLoop = this.fadeOut;
		} else {
			this.onLoop = this.fadeIn;
		}
		
	}
	
	ContinousFade.prototype.fadeIn = function(p) {

		var newAlpha = this.object._alpha + this.rate;
	
		if ( newAlpha < this.max ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( this.max );
			this.onLoop = this.fadeOut;
		}

		return true;

	};
	
	ContinousFade.prototype.fadeOut = function() {
		
		var newAlpha = this.object._alpha - this.rate;

		if ( newAlpha > this.min ) {
			this.object.setAlpha( newAlpha );
		} else {
			this.object.setAlpha( this.min );
			this.onLoop = this.fadeIn;
		}

		return true;
		
	};

	/**
	 * Creates Move object to be applied to the given renderers.Renderizable.
	 * Moves the object closer to the destination when the onLoop method is called
	 *
	 * @class FadeOut
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the animation in seconds
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Move( object, x, y, seconds, onFinished ) {

		this.object = object;
		this._x = x;
		this._y = y;

		if ( seconds == undefined ) seconds = 1;
		
		this.onFinished = onFinished;

		var lib = M.Math2d,
			frames = seconds * M.getAverageFps(),
			coorsFrom = new lib.Vector2d(object._x, object._y),
			coordsTo = new lib.Vector2d(x, y);

		this.speed = lib.getDistance( coorsFrom, coordsTo ) / frames;
		this.direction = M.Math2d.getNormalized( M.Math2d.getVector2d( coorsFrom, coordsTo ) );

	}

	Move.prototype.onLoop = function(p) {

		var moveX = Math.abs( this._x - this.object._x ) > this.speed,
			moveY = Math.abs( this._y - this.object._y ) > this.speed;
			
		if ( moveX ) this.object.offsetX(this.direction.x * this.speed);
		if ( moveY ) this.object.offsetY(this.direction.y * this.speed);

		if ( ! moveX && ! moveY ) {
			this.object.setLocation(this._x, this._y);
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Creates a ScaleUp object to be applied to the given renderers.Renderizable.
	 * Scales the object up when the onLoop method is called
	 *
	 * @class ScaleUp
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function ScaleUp( object, x, y, seconds, onFinished ) {

		var frames = seconds * M.getAverageFps();

		if ( ! object._scale ) {
			object._scale = { x: 1, y: 1 };
		}

		this.speedX = Math.abs( object._scale.x - x ) / frames;
		this.speedY = Math.abs( object._scale.y - y ) / frames;
		this.object = object;
		this._x = x;
		this._y = y;
		this.onFinished = onFinished;

	}

	ScaleUp.prototype.onLoop = function(p) {

		if ( this.object._scale.x < this._x ) {
			this.object._scale.x += this.speedX;
			// this.notifyChange();
		}
		if ( this.object._scale.y < this._y ) {
			this.object._scale.y += this.speedY;
			// this.notifyChange();
		}

		if ( this.object._scale.x >= this._x && this.object._scale.y >= this._y ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};
	
	/**
	 * Creates a ScaleDown object to be applied to the given renderers.Renderizable.
	 * Scales the object down when the onLoop method is called
	 *
	 * @class ScaleDown
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} seconds duration of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function ScaleDown( object, x, y, seconds, onFinished ) {

		var frames = seconds * M.getAverageFps();

		if ( ! object._scale ) {
			object._scale = { x: 1, y: 1 };
		}

		this.speedX = Math.abs( object._scale.x - x ) / frames;
		this.speedY = Math.abs( object._scale.y - y ) / frames;
		this.object = object;
		this._x = x;
		this._y = y;
		this.onFinished = onFinished;

	}

	ScaleDown.prototype.onLoop = function(p) {

		if ( this.object._scale.x > this._x ) {
			this.object._scale.x -= this.speedX;
		}
		if ( this.object._scale.y > this._y ) {
			this.object._scale.y -= this.speedY;
		}

		if ( this.object._scale.x <= this._x && this.object._scale.y <= this._y ) {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Creates a Twinkle object to be applied to the given renderers.Renderizable.
	 * Twinkles the object when the onLoop method is called
	 *
	 * @class Twinkle
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} times times to twinkle
	 * @param {int} duration duration in milliseconds of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Twinkle(object, times, duration, onFinished) {
		this.object = object;
		if ( times == undefined ) {
			this.times = 6;
		} else {
			this.times = times * 2;
		}
		if ( duration == undefined ) {
			this.duration = 250;
		} else {
			this.duration = duration;
		}
		this.lastTime = 0;
		this.onFinished = onFinished;
	}

	Twinkle.prototype.onLoop = function(p) {

		if ( M.getTimeInMillis() - this.lastTime >= this.duration ) {

			if ( this.times-- ) {

				if ( this.object._alpha == 1 ) {
					this.object.setAlpha( 0 );
				} else {
					this.object.setAlpha( 1 );
				}

			} else {

				this.object.setAlpha( undefined );

				if ( this.onFinished ) this.onFinished.apply( this.object );
				return false;

			}

			this.lastTime = M.getTimeInMillis();

		}

		return true;

	};

	/**
	 * Creates a Rotate object to be applied to the given renderers.Renderizable.
	 * Rotates the object when the onLoop method is called
	 *
	 * @class Rotate
	 * @constructor
	 * @extends GameObject
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {float} angle angle to rotate the object to
	 * @param {int} seconds duration in seconds of the effect
	 * @param {Function} onFinished function to execute once the animation is finished
	 */
	function Rotate( object, angle, seconds, onFinished ) {

		if ( ! seconds ) seconds = 1;
	
		this.frames = seconds * M.getAverageFps();

		if ( ! object._rotation ) {
			object._rotation = 0;
		}

		this.object = object;
		this.angle = angle;
		this.onFinished = onFinished;

		this._rotation = ( this.angle - object._rotation ) / this.frames;

	}

	Rotate.prototype.onLoop = function(p) {

		if ( this.frames-- ) {
			this.object.offsetRotation(this._rotation);
		} else {
			if ( this.onFinished ) this.onFinished.apply( this.object );
			return false;
		}

		return true;

	};

	/**
	 * Fades an object in
	 *
	 * Usage example:
	 *
	 * fadeIn( object, seconds, onFinished );
	 *
	 */
	function fadeIn( object, seconds, onFinished ) {
		return new Animation( new FadeIn( object, seconds, onFinished ) ).play();
	}

	/**
	 * Fades an object out
	 *
	 * Usage example:
	 *
	 * fadeOut( object, seconds, onFinished );
	 *
	 */
	function fadeOut( object, seconds, onFinished ) {
		return new Animation( new FadeOut( object, seconds, onFinished ) ).play();
	}

	
	/**
	 * Fades an object out
	 *
	 * Usage example:
	 *
	 * fadeOut( object, seconds, onFinished );
	 *
	 */
	function continousFade( object, seconds, fadeOutFirst ) {
		return new Animation( new ContinousFade( object, seconds, fadeOutFirst ) ).play();
	}

	/**
	 * Moves an object from a position to the other in a certain amout of time
	 *
	 * Usage example:
	 *
	 * move( object, x, y, seconds, acceleration, decceleration, onFinished );
	 *
	 */
	function move( object, x, y, seconds, onFinished ) {
		return new Animation( new Move( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Scales an object from its current scale value to the one provided.
	 *
	 * Usage example:
	 *
	 * scaleUp( object, x, y, seconds, onFinished );
	 *
	 */
	function scaleUp( object, x, y, seconds, onFinished ) {
		return new Animation( new ScaleUp( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Scales an object from its current scale value to the one provided.
	 *
	 * Usage example:
	 *
	 * scaleDown( object, x, y, seconds, onFinished );
	 *
	 */
	function scaleDown( object, x, y, seconds, onFinished ) {
		return new Animation( new ScaleDown( object, x, y, seconds, onFinished ) ).play();
	}

	/**
	 * Makes an object twinkle an amount of times during certain time
	 *
	 * Usage example:
	 *
	 * twinkle( objectToApply, timesToTwinkle, durationInMilliseconds, onFinished );
	 *
	 */
	function twinkle( object, times, duration, onFinished ) {
		return new Animation( new Twinkle( object, times, duration, onFinished ) ).play();
	}

	/**
	 * Rotates an object to the specified angle in seconds
	 *
	 * Usage example:
	 *
	 * rotate( objectToApply, angle, seconds, onFinished );
	 *
	 */
	function rotate( object, angle, seconds, onFinished ) {
		return new Animation( new Rotate( object, angle, seconds, onFinished ) ).play();
	}

	/**
	 * @deprecated
	 * Shakes the canvas for the specified duration of seconds
	 */
	function shakeCanvas( duration ) {

		if ( ! M.canvas.shaking ) {

			M.canvas.shaking = true;
			M.canvas.style.position = "relative";

			M.push({
			
				startTime: M.getGameTime(),

				duration: duration || 1,

				onLoop: function(p) {
					if ( M.getGameTime() - this.startTime < this.duration ) {
						p.canvas.style.left = p.M.randomSign() + "px";
						p.canvas.style.top = p.M.randomSign() + "px";
					} else {
						p.canvas.style.left = "0px";
						p.canvas.style.top = "0px";
						p.M.remove( this );
						p.canvas.shaking = false;
					}
				}

			}, "shake");

		}

	}

	/**
	 * @class visual
	 */
	namespace.visual = {

		Particle: Particle,
		LinearParticleEmitter: LinearParticleEmitter,
		RadialParticleEmitter: RadialParticleEmitter,

		Tint: Tint,

		Move: Move,
		FadeIn: FadeIn,
		FadeOut: FadeOut,
		ContinousFade: ContinousFade,
		ScaleUp: ScaleUp,
		ScaleDown: ScaleDown,
		Rotate: Rotate,
		Twinkle: Twinkle,
		Wait: Wait

	};

})( M.effects || ( M.effects = {} ), M );/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * @class Easing
	 * @namespace visual
	 * @constructor
	 * @param {renderers.Renderizable} object the object to apply the effect to
	 * @param {int} x destination x
	 * @param {int} y destination y
	 * @param {int} durationSeconds duration of the animation in seconds
	 * @param {String} easingMethodX easing function to apply to the x axis
	 * @param {String} easingMethodY easing function to apply to the y axis
	 * Note: for more information on easing please go to http://www.gizma.com/easing/#sin3
	 */
	function Easing(object, endValueX, endValueY, durationSeconds, easingMethodX, easingMethodY, loop, onFinished) {

		this.object = object;

		this.endValueX = endValueX;
		this.endValueY = endValueY;
		
		this.startValueX = 0;
		this.startValueY = 0;

		this.easingMethodX = this[easingMethodX] || this["linearTween"];
		this.easingMethodY = this[easingMethodY] || this.easingMethodX;
	
		this.currentFrame = 1;

		this.durationSeconds = durationSeconds;

		this.mathCached = Math;

		this.totalFrames = 0;
		
		this.loop = loop;
		
		this._needsStartValue = true;
		
		this.onFinished = onFinished;

	}

	Easing.prototype._init = function() {

		var durationSeconds = this.durationSeconds;

		if ( typeof durationSeconds == "string" && durationSeconds.indexOf("px") != -1 ) {
			
			durationSeconds = parseInt(durationSeconds);
			
			var xDistanceToCover = this.endValueX - this.object.getX();
			var yDistanceToCover = this.endValueY - this.object.getY();

			var pixelsPerSecond = durationSeconds;

			var timeToCoverX = xDistanceToCover / pixelsPerSecond;
			var timeToCoverY = yDistanceToCover / pixelsPerSecond;

			durationSeconds = Math.max(timeToCoverX, timeToCoverY);

		}

		this.totalFrames = durationSeconds * M.getAverageFps();

		this.currentFrame = 0;
		
		if ( this._needsStartValue || !this.loop ) {

			this.startValueX = this.object.getX();
			this.startValueY = this.object.getY();
			
			this.endValueX = this.endValueX - this.startValueX;
			this.endValueY = this.endValueY - this.startValueY;
			
			this._needsStartValue = false;
			
		}
		
		
		this.onLoop = this._ease;
		
		return true;
		
	};
	
	Easing.prototype._ease = function () {
	
		this.object.setLocation(
			this.easingMethodX(this.currentFrame, this.startValueX, this.endValueX, this.totalFrames), 
			this.easingMethodY(this.currentFrame, this.startValueY, this.endValueY, this.totalFrames)
		);
		
		this.currentFrame++;
		
		if ( this.currentFrame <= this.totalFrames ) {
			return true;
		} else {
			if ( this.onFinished ) {
				this.onFinished.apply(this.object);
			}
			if ( this.loop ) {
				this.onLoop = this._init;
				return true;
			}
		}
		
		return false;
		
	};

	Easing.prototype.onLoop = Easing.prototype._init;

	/**
	 * Simple linear tweening - no easing, no acceleration
	 * @method linearTween
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.linearTween = function (t, b, c, d) {
		return c*t/d + b;
	};

	/**
	 * Quadratic easing in - accelerating from zero velocity
	 * @method easeInQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuad = function (t, b, c, d) {
		t /= d;
		return c*t*t + b;
	};
			
	/**
	 * quadratic easing out - decelerating to zero velocity
	 * @method easeOutQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuad = function (t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	};
			
	/**
	 * quadratic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuad
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuad = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};

	/**
	 * cubic easing in - accelerating from zero velocity
	 * @method easeInCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInCubic = function (t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	};
			
	/**
	 * cubic easing out - decelerating to zero velocity
	 * @method easeOutCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutCubic = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};
			
	/**
	 * cubic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutCubic
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutCubic = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};
		
	/**
	 * quartic easing in - accelerating from zero velocity
	 * @method easeInQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuart = function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	};
		
	/**
	 * quartic easing out - decelerating to zero velocity
	 * @method easeOutQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuart = function (t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	};

	/**
	 * quartic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuart
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuart = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	};

	/**
	 * quintic easing in - accelerating from zero velocity
	 * @method easeInQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInQuint = function (t, b, c, d) {
		t /= d;
		return c*t*t*t*t*t + b;
	};

	/**
	 * quintic easing out - decelerating to zero velocity
	 * @method easeOutQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutQuint = function (t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	};

	/**
	 * quintic easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutQuint
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutQuint = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t*t*t + 2) + b;
	};

	/**
	 * sinusoidal easing in - accelerating from zero velocity
	 * @method easeInSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInSine = function (t, b, c, d) {
		return -c * this.mathCached.cos(t/d * (this.mathCached.PI/2)) + c + b;
	};

	/**
	 * sinusoidal easing out - decelerating to zero velocity
	 * @method easeOutSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutSine = function (t, b, c, d) {
		return c * this.mathCached.sin(t/d * (this.mathCached.PI/2)) + b;
	};

	/**
	 * sinusoidal easing in/out - accelerating until halfway, then decelerating
	 * @method easeInOutSine
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutSine = function (t, b, c, d) {
		return -c/2 * (this.mathCached.cos(this.mathCached.PI*t/d) - 1) + b;
	};

	/**
	 * exponential easing in - accelerating from zero velocity
	 * @method easeInExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInExpo = function (t, b, c, d) {
		return c * this.mathCached.pow( 2, 10 * (t/d - 1) ) + b;
	};

	/**
	 * exponential easing out - decelerating to zero velocity
	 * @method easeOutExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutExpo = function (t, b, c, d) {
		return c * ( -this.mathCached.pow( 2, -10 * t/d ) + 1 ) + b;
	};

	/**
	 * exponential easing in/out - accelerating until halfway, then decelerating
	 * @method easeInOutExpo
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutExpo = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2 * this.mathCached.pow( 2, 10 * (t - 1) ) + b;
		t--;
		return c/2 * ( -this.mathCached.pow( 2, -10 * t) + 2 ) + b;
	};	

	/**
	 * circular easing in - accelerating from zero velocity
	 * @method easeInCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInCirc = function (t, b, c, d) {
		t /= d;
		return -c * (this.mathCached.sqrt(1 - t*t) - 1) + b;
	};

	/**
	 * circular easing out - decelerating to zero velocity
	 * @method easeOutCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeOutCirc = function (t, b, c, d) {
		t /= d;
		t--;
		return c * this.mathCached.sqrt(1 - t*t) + b;
	};

	/**
	 * Circular easing in/out - acceleration until halfway, then deceleration
	 * @method easeInOutCirc
	 * @param t currentTime current time or frame of the animation. Start needs to be 0 and then you have to increase it on your code
	 * @param b startValue start location
	 * @param c endValue end location. If you're using absolute coordinates you'll have to rest the start value to it
	 * @param d duration. Duration in time or frames of the animation
	 */
	Easing.prototype.easeInOutCirc = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return -c/2 * (this.mathCached.sqrt(1 - t*t) - 1) + b;
		t -= 2;
		return c/2 * (this.mathCached.sqrt(1 - t*t) + 1) + b;
	};

	/*
	Easing.prototype.easeInOutSine = function (currentTime, startValue, endValue, duration) {
		return -endValue / 2 * (this.mathCached.cos(this.mathCached.PI * currentTime / duration) - 1) + startValue;
	};
	Easing.prototype.easeInQuad = function(currentTime, startValue, endValue, duration) {
		currentTime /= duration;
		return endValue * currentTime * currentTime + startValue;
	};
	*/

	namespace.Easing = Easing;

})(M.effects.visual, M);/**
 * @module Match
 */
(function(namespace, M) {

	/**
	 * Fades out a sound
	 * @class SoundFadeOut
	 * @constructor
	 * @namespace sound
	 * @param {Audio} audioObject sound to fade out
	 * @param {int} min final volume - if no provided the sound will stop playing after being faded
	 */
	function SoundFadeOut(audioObject, min) {

		if ( ! min ) {
			this.min = 0.1;
			this.pauseAfterFade = true;
		} else {
			this.min = min;
			this.pauseAfterFade = false;
		}

		this.sound = audioObject;

	}

	SoundFadeOut.prototype = {

		onLoop: function() {

			if ( this.sound.volume > this.min ) {

				this.sound.volume -= 0.004;

			} else {

				if ( this.pauseAfterFade ) {
					this.sound.pause();
				}

				M.remove(this);

			}

		}

	};

	/**
	 * Fades in a sound
	 * @class SoundFadeIn
	 * @constructor
	 * @namespace sound
	 * @param {Audio} audioObject sound to fade in
	 * @param {int} max final volume
	 */
	function SoundFadeIn(audioObject, max) {

		if ( ! max ) {
			this.max = 0.9;
		}

		this.sound = audioObject;

	}

	SoundFadeIn.prototype = {

		onLoop: function() {
			if ( this.sound.volume < this.max ) {
				this.sound.volume += 0.004;
			} else {
				M.remove(this);
			}
		}

	};

	/**
	 * Transition effect fading out a sound and fading in another
	 * @class Transition
	 * @constructor
	 * @param {Audio} soundFrom sound to fade out
	 * @param {Audio} soundTo sound to fade in
	 * @param {int} maxVolume final volume of the faded in sound
	 */
	function Transition(soundFrom, soundTo, maxVolume) {
		this.soundFrom = soundFrom;
		this.soundTo = soundTo;
		this.max = maxVolume;
		this.currentStep = this.fadeOut;
	}

	Transition.prototype = {
		fadeOut: function() {
			if ( this.soundFrom.volume > 0.05 ) {
				this.soundFrom.volume -= 0.004;
			} else {
				this.soundFrom.pause();
				this.soundTo.volume = 0;
				this.soundTo.play();
				this.currentStep = this.fadeIn;
			}
		},
		fadeIn: function() {
			if ( this.soundTo.volume < this.max ) {
				this.soundTo.volume += 0.004;
			} else {
				M.remove(this);
			}
		},
		onLoop: function() {
			this.currentStep();
		}
	};

	/**
	 * Fades out a sound to play the other to fade in the first after finished
	 * @class SoundOver
	 * @constructor
	 * @param {Audio} soundFrom sound to lower
	 * @param {Audio} soundTo sound to play
	 */
	function SoundOver(soundFrom, soundTo) {
		this.max = soundFrom.volume;
		this.soundFrom = soundFrom;
		this.soundTo = soundTo;
		this.currentStep = this.fadeOut;
	}

	SoundOver.prototype = {
		fadeOut: function() {
			if ( this.soundFrom.volume > 0.25 ) {
				this.soundFrom.volume -= 0.01;
			} else {
				this.soundTo.play();
				this.currentStep = this.fadeIn;
			}
		},
		fadeIn: function() {
			if ( this.soundTo.ended && this.soundFrom.volume < this.max ) {
				this.soundTo.volume += 0.01;
			} else {
				M.remove(this);
			}
		},
		onLoop: function() {
			this.currentStep();
		}
	};

	/**
	 * Plays a sound after the other
	 * @class SoundQueue
	 * @constructor
	 * @param {Array} List of Audio to play
	 */
	function SoundQueue(list) {
		this.sounds = list;
		this.currentSoundIndex = 0;
		this.sounds[0].play();
	}

	SoundQueue.prototype = {

		onLoop: function() {

			if ( this.sounds[this.currentSoundIndex].ended ) {

				this.currentSoundIndex++;

				if ( this.currentSoundIndex < this.sounds.length ) {
					this.sounds[this.currentSoundIndex].play();
				} else {
					M.remove(this);
				}

			}

		}

	};
	
	/**
	 * @class sound
	 */

	/**
	 * Adds a fade out effect to Match loop list. Shorthand for SoundFadeOut
	 * @method addFadeOut
	 * @param {Audio} audioObject sound to fade out
	 * @param {int} min final volume - if no provided the sound will stop playing after being faded
	 */
	function addFadeOut(audioObject, min) {
		M.push(new SoundFadeOut(audioObject, min));
	}    

	/**
	 * Adds a fade in effect to Match loop list. Shorthand for SoundFadeIn
	 * @method addFadeIn
	 * @param {Audio} audioObject sound to fade in
	 * @param {int} max final volume
	 */
	function addFadeIn(audioObject, max) {
		M.push(new SoundFadeIn(audioObject, max));
	}

	/**
	 * Adds a sound transition effect to Match loop list. Shorthand for Transition
	 * @method addSoundTransition
	 * @param {Audio} soundFrom sound to fade out
	 * @param {Audio} soundTo sound to fade in
	 * @param {int} maxVolume final volume of the faded in sound
	 */
	function addSoundTransition(soundFrom, soundTo, maxVolume) {
		M.push(new Transition(soundFrom, soundTo, maxVolume));
	}
	/**
	 * Fade out a sound and plays the other. After finishing fades in the previous sound to its original volume. Shorthand for SoundOver
	 * @method addSoundOver
	 * @param {Audio} soundFrom sound to lower
	 * @param {Audio} soundTo sound to play
	 */
	function addSoundOver(soundFrom, soundTo) {
		M.push(new SoundOver(soundFrom, soundTo));
	}

	/**
	 * Crease a sound queue. Shorthand for SoundQueue
	 * @method addSoundQueue
	 * @param {Array} List of Audio to play
	 */
	function addSoundQueue(list) {
		M.push(new SoundQueue(list));
	}

	namespace.sound = {
		fadeOut: addFadeOut,
		fadeIn: addFadeIn,
		transition: addSoundTransition,
		soundOver: addSoundTransition,
		soundQueue: addSoundQueue
	};

})( M.effects || ( M.effects = {} ), M );(function(M, namespace) {

	function AllvsAllCollisionHandler( mode ) {

		this.objects = [];

		this.mode = null;

		this.setMode( mode || "Polygon" );

	}

	AllvsAllCollisionHandler.prototype = {

		reset: function() {
			this.objects = [];
		},

		onLoop: function() {

			var i = 0, j = 1;

			while ( i < this.objects.length ) {

				while ( j < this.objects.length ) {
					this.checkCollisions( this.objects[i], this.objects[j] );
					j++;
				}
				i++;
				j = i + 1;

			}

			i = this.objects.length;

			while ( i-- ) {
				if ( ! this.objects[i]._visible ) {
					M.removeIndexFromArray( i, this.objects );
				}
			}

		},

		canCollide: function( collider, collidable ){

			if ( collider.cantCollideType  ) {

				var i = collider.cantCollideType.length;

				while ( i-- ) {
					if ( collidable instanceof collider.cantCollideType[i] ) return false;
				}

			}
		
			if ( collider.cantCollide ) {

				var i = collider.cantCollide.length;

				while ( i-- ) {
					if ( collider.cantCollide[i] == collidable ) return false;
				}

			}

			return true;

		},

		checkCollisions: function(collider, collidable) {

			if ( ! this.canCollide( collider, collidable ) ) return;
			if ( ! this.canCollide( collidable, collider ) ) return;

			if ( this.mode.haveCollided( collider, collidable ) ) {

				if ( collider.onCollision ) {
					collider.onCollision( collidable );
				}
				if ( collidable.onCollision ) {
					collidable.onCollision( collider );
				}

			}

		},

		/**
		 * @param The collision mode from namespace.collisions
		 */
		setMode: function(mode, properties) {

			if ( typeof mode === "string" ) {
				this.mode = M.collisions[mode];
			} else {
				this.mode = mode;
			}

		},

		push: function( object ) {
			this.objects.push( object );
		},

		removeType: function( type ) {

			var i = this.objects.length;

			while ( i-- ) {
				if ( this.objects[i] instanceof type ) {
					this.remove( this.objects[i] );
				}
			}

		}

	};

	namespace.AllvsAllCollisionHandler = AllvsAllCollisionHandler;
	
})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );(function(M, namespace) {

	function CollisionHandler(mode) {

		this.colliders = [];

		this.collidables = [];

		this.setMode( mode || "Polygon" );

		this.colliderCallback = "onCollision";

		this.collidableCallback = "onCollision";

	}

	CollisionHandler.prototype = {

		onLoop: function() {

			var i = this.colliders.length;

			while ( i-- ) {
				this.checkCollisions( this.colliders[i], this.collidables );
			}

		},

		checkCollisions: function(collider, list) {

			if ( ! collider ) return;

			var i = list.length, collidable = null;

			while ( i-- ) {

				collidable = list[i];

				if ( ! collidable ) return;

				if ( collidable instanceof Array ) {

					this.checkCollisions( collider, collidable );

				} else if ( this.mode.haveCollided( collider, collidable ) ) {

					if ( collider[this.colliderCallback] ) {
						collider[this.colliderCallback]( collidable );
					}
					if ( collidable[this.collidableCallback] ) {
						collidable[this.collidableCallback]( collider );
					}

				}

			}

		},

		/**
		 * @param The collision mode from namespace.collisions
		 */
		setMode: function(mode) {

			if ( typeof mode === "string" ) {
				this.mode = M.collisions[mode];
			} else {
				this.mode = mode;
			}

		}

	};

	namespace.CollisionHandler = CollisionHandler;
	
})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );(function(namespace, math2d) {

	/**
	 * Square with ray casting collision detection
	 * Once the object is inside the square ray casting is applied for 
	 * more accurate detection on the inner rectangular object.
	 * This is the most accurate detection method but also the most
	 * processing time consuming
	 */
	function Polygon() {
		this.math2d = math2d;
	}

	Polygon.prototype = {

		getCollisionArea: function(renderizable) {

			var vertices = [],
				halfWidth = renderizable.getWidth() / 2,
                halfHeight = renderizable.getHeight() / 2;

			vertices.push({ x: -halfWidth, y: -halfHeight });
			vertices.push({ x: halfWidth, y: -halfHeight });
			vertices.push({ x: halfWidth, y: halfHeight });
			vertices.push({ x: -halfWidth, y: halfHeight });
            
			this.rotate(vertices, renderizable._rotation);
            
            this.translate(vertices, renderizable._x, renderizable._y);

			return vertices;

		},

		translate: function(vertices, x, y) {
			for ( var i = 0; i < vertices.length; i++ ) {
				vertices[i].x += x;
				vertices[i].y += y;
			}
		},

		rotate: function(vertices, angle) {
			if ( ! angle ) return;
			for ( var i = 0; i < vertices.length; i++ ) {
				vertices[i] = this.math2d.getRotatedVertex(vertices[i], angle);
			}
		},        

		haveCollided: function(collider, collidable) {

			var collidableVertices = this.getCollisionArea(collidable),
				colliderVertices =  this.getCollisionArea(collider),
				i = 0;

			for ( ; i < colliderVertices.length; i++ ) {
				if ( this.pointInPolygon( colliderVertices[i].x, colliderVertices[i].y, collidableVertices ) ) return true;
				if ( this.pointInPolygon( collidableVertices[i].x, collidableVertices[i].y, colliderVertices ) ) return true;
			}

			return false;

		},

		pointInPolygon: function(x, y, vertices) {

			var i, j, c = false, nvert = vertices.length, vi, vj;

			for ( i = 0, j = nvert-1; i < nvert; j = i++ ) {
			
				vi = vertices[i];
				vj = vertices[j];
			
				if ( ( ( vi.y > y ) != ( vj.y > y ) ) && ( x < ( vj.x - vi.x ) * ( y - vi.y ) / ( vj.y - vi.y ) + vi.x ) ) {
					c = !c;
				}

			}

			return c;

		}

	};

	namespace.Polygon = new Polygon();
	
})(window.Match.collisions || ( window.Match.collisions = {} ), window.Match.math2d );(function(namespace) {

	/**
	 * Square collision detection
	 * Uses the max size of the object to generate a square centered at the center
	 * of the object
	 */
	function Square() {
	}

	Square.prototype = {

		haveCollided: function(collider, collidable) {

			var sizeThis = 0, sizeObj = 0;

			if ( collider._halfWidth > collider._halfHeight ) {
				sizeThis = collider._halfWidth;
			} else {
				sizeThis = collider._halfHeight;
			}

			if ( collidable._halfWidth > collidable._halfHeight ) {
				sizeObj = collidable._halfWidth;
			} else {
				sizeObj = collidable._halfHeight;
			}

			if ( collider._y + sizeThis < collidable._y - sizeObj ) return false;
			if ( collider._y - sizeThis > collidable._y + sizeObj ) return false;
			if ( collider._x + sizeThis < collidable._x - sizeObj ) return false;
			if ( collider._x - sizeThis > collidable._x + sizeObj ) return false;

			return true;

		}

	};

	namespace.Square = new Square();

})(window.Match.collisions || ( window.Match.collisions = {} ));(function(namespace, math2d) {

	/**
	 * Radial collision detection
	 * Uses the radius provided to compare it to the other objects radius
	 */
	function Radial(radius) {
		this.math2d = math2d;
	}

	Radial.prototype = {

		haveCollided: function(collider, collidable) {

			var colliderradius = ( collider.getWidth() * collider.getHeight() ) / 2,
				collidableradius = ( collidable.getWidth() * collidable.getHeight() ) / 2,
				radius = colliderradius < collidableradius ? colliderradius : collidableradius;

			return this.math2d.getSquareDistance( collider.getLocation(), collidable.getLocation() ) <= radius * radius;

		}

	};

	namespace.Radial = new Radial();
	
})(window.Match.collisions || ( window.Match.collisions = {} ), window.Match.math2d );(function(namespace) {

	function Simple() {
	}

	Simple.prototype = {
	
		haveCollided: function(collider, collidable) {

			if ( collider.getBottom() < collidable.getTop() ) return false;
			if ( collider.getTop() > collidable.getBottom() ) return false;
			if ( collider.getRight() < collidable.getLeft() ) return false;
			if ( collider.getLeft() > collidable.getRight() ) return false;

			return true;

		}

	};

	namespace.Simple = new Simple();
	
})(window.Match.collisions || ( window.Match.collisions = {} ));(function(M, namespace) {

	function PixelPerfect() {
		this.testContext = document.createElement("canvas").getContext("2d");
	}

	PixelPerfect.prototype.haveCollided = function( collider, collidable ) {

		var frontCanvas = M.frontBuffer.canvas,
			math = window.Math,
			minX = math.min(collider.getLeft(), collidable.getLeft()),
			minY = math.min(collider.getTop(), collidable.getTop()),
			width = math.max(collider.getRight(), collidable.getRight()) - minX,
			height = math.max(collider.getBottom(), collidable.getBottom()) - minY,
			context = this.testContext,
			column = 0,
			row = 0,
			imageData;

		context.clearRect( minX, minY, width, height );

		context.save();
		collider.onRender(context, context.canvas, 0, 0);
		context.globalCompositeOperation = "source-in";
		collidable.onRender(context, context.canvas, 0, 0);
		context.restore();

		imageData = context.getImageData( minX, minY, width, height );

		while( column < imageData.width ) {

			while( row < imageData.height ) {

				var offset = ( row * imageData.width + column ) * 4;

				if ( imageData.data[ offset + 3 ] != 0 ) {
					return true;
				}

				row++;

			}

			column++;
			row = 0;

		}

		return false;

	};

	namespace.PixelPerfect = new PixelPerfect();

})(window.Match, window.Match.collisions || ( window.Match.collisions = {} ) );/**
 * @module Match
 * @submodule input
 */
(function(M) {

	var instance;

	function mouseDownHelper(e) {
		instance.mousedown(e);
	}
	function mouseUpHelper(e) {
		instance.mouseup(e);
	}
	function mouseClickHelper(e) {
		instance.click(e);
	}
	function mouseMoveHelper(e) {
		instance.mousemove(e);
	}
	function mouseWheelHelper(e) {
		instance.mousewheel(e);
	}
	function mouseWheelHelperFireFox(e) {
		instance.DOMMouseScroll(e);
	}
	function contextMenuHelper(e) {
		e.preventDefault();
	}

	/**
	 * Provides mouse support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Mouse
	 * @namespace input
	 * @static
	 */
	function Mouse() {
		/**
		 * Object that contains mouse events for the existing buttons
		 * @property LEFT
		 * @private
		 * @type Object
		 */
		this.events = {
			0: {},
			1: {},
			2: {}
		};
		/**
		 * x coordinate of the mouse
		 * @property x
		 * @type int
		 */
		this.x = null;
		/**
		 * y coordinate of the mouse
		 * @property y
		 * @type int
		 */
		this.y = null;
		/**
		 * Indicates whether draggin is taking place or not
		 * @property isDragging
		 * @private
		 * @type Boolean
		 */
		this.isDragging = false;

	}

	/**
	 * Left mouse button
	 * @property LEFT
	 * @final
	 * @type int
	 */
	Mouse.prototype.LEFT = 0;
	/**
	 * Middle mouse button
	 * @property MIDDLE
	 * @final
	 * @type int
	 */
	Mouse.prototype.MIDDLE = 1;
	/**
	 * Right mouse button
	 * @property RIGHT
	 * @final
	 * @type int
	 */
	Mouse.prototype.RIGHT = 2;
	/**
	 * Sets the selected object if there is not dragging going on
	 * @method select
	 * @param {Object} object the object to select
	 * @param {Event} event
	 * @private
	 */
	Mouse.prototype.select = function( object ) {

		if ( ! this.isDragging ) {
			this.selectedObject = object;
		}

	};
	/**
	 * Prevents the context menu from showing up when the user right clicks on the document
	 * @method preventContexMenu
	 * @param {Boolean} value boolean that determines whether to prevent context menu or not
	 */
	Mouse.prototype.preventContexMenu = function(value) {
		if ( value ) {
			document.addEventListener("contextmenu", contextMenuHelper, false );
		} else {
			document.removeEventListener("contextmenu", contextMenuHelper, false );
		}
	};
	/**
	 * Executes the events of the selected object
	 * @method fireEventOnLastSelectedObject
	 * @private
	 */
	Mouse.prototype.fireEventOnLastSelectedObject = function() {

		var s = this.selectedObject,
			ps = this.prevSelectedObject;

		if ( s ) {
			if ( !s._mouseInRaised && s.listensTo("mouseIn") ) {
				s._mouseInRaised = true;
				s.raiseEvent("mouseIn", this);
			}
			if ( ps && ps != s ) {
				ps._mouseInRaised = false;
				if ( ps.listensTo("mouseOut") ) {
					ps.raiseEvent("mouseOut", this);
				}
			} 
			if ( this.up() && s.listensTo("mouseUp") ) {
				s.onMouseUp(this);
			}
			if ( this.clicked() && s.listensTo("click") ) {
				s.raiseEvent("click", this);
			}
			if ( this.down() ) {
				if ( s.listensTo("mouseDown") ) {
					s.raiseEvent("mouseDown", this);
				}
				this.isDragging = true;
				if ( s.listensTo("mouseDrag") ) {
					s.raiseEvent("mouseDrag", this);
				}
			}
			if ( s.listensTo("mouseOver") ) {
				s.raiseEvent("mouseOver", this);
			}
			if ( this.moved() && s.listensTo("mouseMove") ) {
				s.raiseEvent("mouseMove", this);
			}
			if ( this.wheel() && s.listensTo("mouseWheel") ) {
				s.raiseEvent("mouseWheel", this);
			}
		} else if ( ps && ps.listensTo("mouseOut") ) {
			ps._mouseInRaised = false;
			ps.raiseEvent("mouseOut", this);
		}
		
		this.prevSelectedObject = s;
		
		if ( ! this.isDragging ) {
			this.selectedObject = null;
		}

	};
	/**
	 * Returns whether the given button has been pressed and released
	 * @method clicked
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button was pressed and released and false if not
	 */
	Mouse.prototype.clicked = function( button ) {
		if ( button != null ) {
			return this.events[ button ].click;
		}
		return this.events[0].click;
	};
	/**
	 * Returns whether the given button is being pressed
	 * @method down
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button is being pressed and false if not
	 */
	Mouse.prototype.down = function( button ) {
		if ( button != null ) {
			return this.events[ button ].down;
		}
		return this.events[0].down || this.events[1].down || this.events[2].down;
	};
	/**
	 * Returns whether the given button has been released
	 * @method up
	 * @param {int} button one of Mouse.LEFT, Mouse.MIDDLE, Mouse.RIGHT
	 * @return {Boolean} true if the button has been released and false if not
	 */
	Mouse.prototype.up = function( button ) {
		if ( button != null ) {
			return this.events[ button ].up;
		}
		return this.events[0].up || this.events[1].up || this.events[2].up;
	};
	/**
	 * Returns the move event or null if the mouse has not moved
	 * @method moved
	 * @return {Event} mouse event
	 */
	Mouse.prototype.moved = function() {
		return this.eventMouseMove;
	};
	/**
	 * Returns the wheel delta y
	 * @method wheel
	 * @return {int} delta y
	 */
	Mouse.prototype.wheel = function() {
		this.wheelDeltaY = 0;
		if ( this.eventMouseWheel ) {
			this.wheelDeltaY = this.eventMouseWheel.wheelDeltaY;
		}
		return this.wheelDeltaY;
	};
	/**
	 * Clears mouse events. This method is to be called once after game loop
	 * @protected
	 * @method clear
	 */
	Mouse.prototype.clear = function() {

		for ( var i = 0; i < 3; i++ ) {
			this.events[i].up = null;
			this.events[i].click = null;
		}

		this.eventMouseWheel = null;
		this.eventMouseMove = null;

	};
	/**
	 * Sets the mouse click event and updates mouse location
	 * @method click
	 * @private
	 * @param {Event} e the mouse event
	 */
	Mouse.prototype.click = function( e ) {
		this.events[ e.button ].click = e;
		this.x = e.offsetX;
		this.y = e.offsetY;
	};
	/**
	 * Sets the mouse down event
	 * @method mousedown
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mousedown = function( e ) {
		this.events[ e.button ].down = e;
	};
	/**
	 * Sets the mouse up event and releases dragging
	 * @method mouseup
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mouseup = function( e ) {
		this.events[ e.button ].down = null;
		this.events[ e.button ].up = e;
		this.isDragging = false;
	};
	/**
	 * Sets the mouse wheel event for every browser except Firefox
	 * @method mousewheel
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.mousewheel = function( e ) {
		this.eventMouseWheel = e;
		};
	/**
	 * Sets the mouse wheel event. For Firefox only
	 * @method mousewheel
	 * @private
	 * @param {Event} e mouse event
	 */
	Mouse.prototype.DOMMouseScroll = function( e ) {
		this.mousewheel( { wheelDeltaY: e.detail * -40 } );
	};
	/**
	 * Returns whether the mouse is over the given object
	 * @method isOverPixelPerfect
	 * @param {renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 */
	Mouse.prototype.isOverPixelPerfect = function( renderizable ) {
		if ( ! renderizable._visible ) return;
		var ctx = M.offScreenContext,
			cnv = M.offScreenCanvas,
			camera = M.getCamera();
		cnv.width = M.renderer.frontBuffer.canvas.width;
		cnv.height = M.renderer.frontBuffer.canvas.height;
		ctx.save();
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		M.renderer.render(renderizable, ctx, camera._x, camera._y);
		ctx.restore();
		var imgData = ctx.getImageData(this.x, this.y, 1, 1);
		if ( !imgData.data[3] ) return false;
		if ( imgData.data[0] ) return true;
		if ( imgData.data[1] ) return true;
		if ( imgData.data[2] ) return true;
		return false;
	};
	/**
	 * Returns whether the mouse is over the given renderizable or not
	 *
	 * @method isOverPolygon
	 * @param {renderers.Renderizable} renderizable
	 * @param {Camera} camera
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Mouse.prototype.isOverPolygon = function (renderizable) {
		var camera = M.getCamera(),
			x = this.x + camera._x,
			y = this.y + camera._y;
		if (renderizable._rotation) {
			this._x = x;
			this._y = y;
			return M.collisions.Polygon.haveCollided(renderizable, this);
		} else {
			if (renderizable.getBottom() < y) return false;
			if (renderizable.getTop() > y) return false;
			if (renderizable.getRight() < x) return false;
			if (renderizable.getLeft() > x) return false;
			return true;
		}
	};
	Mouse.prototype.getHeight = function() {
		return 2;
	};
	Mouse.prototype.getWidth = function() {
		return 2;
	};
	/**
	 * Fires mouse event on the object that is under the mouse and clears input
	 * @method update
	 */
	Mouse.prototype.update = function() {
		this.fireEventOnLastSelectedObject();
		this.clear();
	};
	/**
	 * Looks for mouse methods in the provided object and executes them if the object has focus.
	 * @method applyToObject
	 * @private
	 * @param {M.renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 *
	 * @example 
			Ninja.prototype.throwStar = function() { 
				//throw ninja star
			}
			Ninja.prototype.onMouseDown = function(mouse) {
				if ( mouse.down(mouse.LEFT) ) {
					this.throwStar();
				}
			}
	 */
	Mouse.prototype.applyToEntity = function( renderizable ) {
		if ( renderizable.onMouseOver || renderizable.onMouseIn || renderizable.onMouseOut || renderizable.onMouseWheel || ( renderizable.onMouseDown && this.down() ) || ( renderizable.onMouseUp && this.up() ) || ( renderizable.onClick && this.clicked() ) ) {
			if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
				this.select(renderizable);
			}
		}
	};

	Mouse.prototype.applyToObject = function( entity ) {
	
		var views = entity.views._values,
			i = 0,
			l = views.length,
			renderizable;

		if ( entity.listensTo("mouseOver") || entity.listensTo("mouseIn") || entity.listensTo("mouseOut") || entity.listensTo("onMouseWheel") || ( entity.listensTo("mouseDown") && this.down() ) || ( entity.listensTo("mouseUp") && this.up() ) || ( entity.listensTo("click") && this.clicked() ) ) {

		// if ( entity.onMouseOver || entity.onMouseIn || entity.onMouseOut || entity.onMouseWheel || ( entity.onMouseDown && this.down() ) || ( entity.onMouseUp && this.up() ) || ( entity.onClick && this.clicked() ) ) {

			for (; i < l; i++ ) {

				renderizable = views[i];

				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.select(entity);
				}

			}
			
		}

	};

	if ( M.browser.isFirefox ) {

		Mouse.prototype.mousemove = function(e) {
			this.eventMouseMove = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

		Mouse.prototype.click = function( e ) {
			this.events[ e.button ].click = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.layerX - e.target.offsetLeft;
			this.y = e.layerY - e.target.offsetTop;
		};

	} else {

		Mouse.prototype.mousemove = function( e ) {
			this.eventMouseMove = e;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x = e.offsetX;
			this.y = e.offsetY;
		};

	}

	Mouse.prototype.bind = function() {
		if ( M.browser.isFirefox  ) {
			document.addEventListener("DOMMouseScroll", mouseWheelHelperFireFox, false);
		} else if ( M.browser.name == "MSIE 9.0" ) {
			document.addEventListener("onwheel", mouseWheelHelper, false);
		} else {
			document.addEventListener("mousewheel", mouseWheelHelper, false);
		}
		document.addEventListener("mousedown", mouseDownHelper, false);
		document.addEventListener("mouseup", mouseUpHelper, false);
		document.addEventListener("mousemove", mouseMoveHelper, false);
		document.addEventListener("click", mouseClickHelper, false);
		M.setMouse(this);
	};

	Mouse.prototype.unbind = function() {
		if ( M.browser.isFirefox  ) {
			document.removeEventListener("DOMMouseScroll", mouseWheelHelperFireFox);
		} else if ( M.browser.name == "MSIE 9.0" ) {
			document.removeEventListener("onwheel", mouseWheelHelper);
		} else {
			document.removeEventListener("mousewheel", mouseWheelHelper);
		}
		document.removeEventListener("mousedown", mouseDownHelper);
		document.removeEventListener("mouseup", mouseUpHelper);
		document.removeEventListener("mousemove", mouseMoveHelper);
		document.removeEventListener("click", mouseClickHelper);
		M.setMouse(null);
	};

	instance = new Mouse();
	instance.bind();

})(window.Match);/**
 * @module Match
 */
(function(M) {

	var instance;

	function devicemotion(e) {
		instance.accelerate(e);
	}

	function Accelerometer() {
	}

	Accelerometer.prototype.accelerate = function(event) {
		this._hasEvent = true;
		this.accelerationIncludingGravity = event.accelerationIncludingGravity;
		this.acceleration = event.acceleration;
		this.rotationRate = event.rotationRate;
	};

	Accelerometer.prototype.update = function() {
		this._hasEvent = false;
	};

	Accelerometer.prototype.right = function() {
		return this._hasEvent && (this.acceleration.x > 0 || this.accelerationIncludingGravity.x > 0);
	};
	Accelerometer.prototype.left = function() {
		return this._hasEvent && (this.acceleration.x < 0 || this.accelerationIncludingGravity.y < 0);
	};
	Accelerometer.prototype.up = function() {
		return this._hasEvent && this.acceleration.y > 0;
	};
	Accelerometer.prototype.down = function() {
		return this._hasEvent && this.acceleration.y < 0;
	};

	Accelerometer.prototype.applyToObject = function(node) {
		if ( this._hasEvent ) {
			if ( node.onDeviceAccelerationIncludingGravity ) {
				node.onDeviceAccelerationIncludingGravity(this.accelerationIncludingGravity.x, this.accelerationIncludingGravity.y, this.accelerationIncludingGravity.z, this.rotationRate);
			}
			if ( node.onDeviceAcceleration ) {
				node.onDeviceAcceleration(this.acceleration.x, this.acceleration.y, this.acceleration.z, this.rotationRate);
			}
			if ( node.onDeviceRotation ) {
				/*
				 * alpha
				 *	The rate at which the device is rotating about its Z axis; that is, being twisted about a line perpendicular to the screen.
				 * beta
				 *	The rate at which the device is rotating about its X axis; that is, front to back.
				 * gamma
				 *	The rate at which the device is rotating about its Y axis; that is, side to side.
				 */
				node.onDeviceRotation(this.rotationRate.alpha, this.rotationRate.beta, this.rotationRate.gamma);
			}
		}
	};

	Accelerometer.prototype.bind = function() {
		window.addEventListener("devicemotion", devicemotion, false);
		M.setAccelerometer(this);
	};

	Accelerometer.prototype.unbind = function() {
		window.removeEventListener("devicemotion", devicemotion);
		M.setAccelerometer(null);
	};

	instance = new Accelerometer();
	instance.bind();

})(window.Match);/**
 * @module Match
 */
(function(M) {

	var instance;

	function onkeydown(e) {
		instance.fireDown( e );
	}

	function onkeyup(e) {
		instance.fireUp( e );
	}

	/**
	 * Provides keyboard support.
	 * This class is automatically binded to Match if this file is included. Can be accessed by M.keyboard
	 * @class Keyboard
	 * @namespace input
	 * @static
	 */
	function Keyboard() {
		/**
		 * Map of <String, Boolean> containing true for keys that are being pressed
		 * @property keysDown
		 * @type {Map}
		 */
		this.keysDown = {
			length: 0
		};
		/**
		 * Map of <String, Boolean> containing true for keys that were released
		 * @property keysUp
		 * @type {Map}
		 */
		this.keysUp = null;
		/**
		 * Map of <String, Boolean> containing true for keys that were pressed (down -> executes and disables, up -> enables)
		 * @property keysUp
		 * @type {Map}
		 */
		this.keysPressed = {            
		};
	}

	Keyboard.prototype.bind = function() {
		document.addEventListener("keydown", onkeydown, false);
		document.addEventListener("keyup", onkeyup, false);
		M.setKeyboard(this);
	};

	Keyboard.prototype.unbind = function() {
		document.removeEventListener("keydown", onkeydown);
		document.removeEventListener("keyup", onkeyup);
		M.setKeyboard(null);
	};

	Keyboard.prototype[8] 	= "backspace";
	Keyboard.prototype[9] 	= "tab";
	Keyboard.prototype[13] 	= "enter";
	Keyboard.prototype[16] 	= "shift";
	Keyboard.prototype[17]	= "ctrl";
	Keyboard.prototype[18] 	= "alt";
	Keyboard.prototype[19]	= "pause";
	Keyboard.prototype[20]	= "capslock";
	Keyboard.prototype[27]	= "escape";
	Keyboard.prototype[32]	= "space";
	Keyboard.prototype[33] 	= "pageup";
	Keyboard.prototype[34] 	= "pagedown";
	Keyboard.prototype[35] 	= "end";
	Keyboard.prototype[36] 	= "home";
	Keyboard.prototype[37] 	= "left";
	Keyboard.prototype[38] 	= "up";
	Keyboard.prototype[39] 	= "right";
	Keyboard.prototype[40] 	= "down";
	Keyboard.prototype[45] 	= "insert";
	Keyboard.prototype[46] 	= "delete";
	Keyboard.prototype[112] = "f1";
	Keyboard.prototype[113] = "f2";
	Keyboard.prototype[114] = "f3";
	Keyboard.prototype[115] = "f4";
	Keyboard.prototype[116] = "f5";
	Keyboard.prototype[117] = "f6";
	Keyboard.prototype[118] = "f7";
	Keyboard.prototype[119] = "f8";
	Keyboard.prototype[120] = "f9";
	Keyboard.prototype[121] = "f10";
	Keyboard.prototype[122] = "f11";
	Keyboard.prototype[123] = "f12";
	Keyboard.prototype[145] = "numlock";
	Keyboard.prototype[220] = "pipe";
    /**
     * Method that gets executed when the user is pressing a key
     * @method fireDown
     * @private
     * @param {Event} event
     */
    Keyboard.prototype.fireDown = function( event ) {

		var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

		this.keysDown[ key ] = true;

        if ( this.keysPressed[ key ] == undefined ) {
            this.keysPressed[ key ] = true;
        }
		
		this.keysDown.length++;

	};
	/**
	 * Method that gets executed when the released user a key
	 * @method fireUp
	 * @private
	 * @param {Event} event
	 */
	Keyboard.prototype.fireUp = function( event ) {

		var key = this[ event.which ] || String.fromCharCode( event.which ).toLowerCase();

		if ( ! this.keysUp ) this.keysUp = {};

		this.keysDown[ key ] = false;
        this.keysPressed[ key ] = undefined;
		this.keysUp[ key ] = true;
		
		if ( this.keysDown.length > 0 ) this.keysDown.length--;

	};
	/**
	 * Clears the keysUp Map to avoid further executions when the keys where long released
	 * @method update
	 */
	Keyboard.prototype.update = function() {
		this.keysUp = null;
        for ( var i in this.keysPressed ) {
            if ( this.keysPressed[i] ) {
                this.keysPressed[i] = false;
            }
        }
	};
	/**
	 * Looks for onKeyDown and onKeyUp methods in the provided object and executes them if the object has focus.
	 * Also, if the object has keyDownMappings or keyUpMappings and a key event binded to any of those is executed
	 * then KeyboardInputHandler executes the specified method on the object
	 * @method applyToObject
	 *
	 * @example 
			Ninja.prototype.moveUp = function() { 
			 //move the ninja up 
			}
			Ninja.prototype.keyDownMappings = {
				"up": "moveUp"
			}
			//Both examples result in the execution of the moveUp method
			Ninja.prototype.onKeyUp = function(keysUp) {
				if ( keysUp.up ) {
					this.moveUp();
				}
			}
	 */
	Keyboard.prototype.applyToObject = function( object ) {

		if ( object.listensTo("keyDown") ) {
			object.raiseEvent("keyDown", this.keysDown);
		}

		if ( object.listensTo("keyUp" ) ) {
			object.raiseEvent("keyUp", this.keysUp);
		}
		
		// if ( object.keyDownMappings && this.keysDown.length > 0 ) {
		// 	for ( var i in object.keyDownMappings ) {
		// 		if ( this.keysDown[i] ) object[object.keyDownMappings[i]]();
		// 	}
		// }
		// if ( object.keyUpMappings && this.keysUp ) {
		// 	for ( var i in object.keyUpMappings ) {
		// 		if ( this.keysUp[i] ) object[object.keyUpMappings[i]]();
		// 	}
		// }

	};

    Keyboard.prototype.getKeyCode = function(key) {
        return key.charCodeAt(0);
    }

    var instance = new Keyboard();
   	instance.bind();

})(window.Match);/**
 * @module Match
 */
(function(M) {

	var instance;

	function touchStartHelper(event) {
		instance.start(event);
	}
	function touchEndHelper(event) {
		instance.end(event);
	}
	function touchCancelHelper(event) {
		instance.cancel(event);
	}
	function touchLeaveHelper(event) {
		instance.leave(event);
	}
	function touchMoveHelper(event) {
		instance.move(event);
	}

	function Touch() {

		/*
		 * IE handles touch with MSPointerDown, MSPointerUp and MSPointerMove. We must update this interfac
		 * to support IE or user will have to default to mouse
		 */

		this.x = 0;
		this.y = 0;

		this.isDragging = false;

		this.events = {
			start: null,
			end: null,
			move: null
		};

	}

	Touch.prototype.clear = function() {
		if ( this.events.end ) {
			this.events.start = null;
			this.x = 0;
			this.y = 0;
		}
		this.events.end = null;
		this.events.move = null;
		this.force = null;
		if ( !this.isDragging ) {
			this.selectedObject = null;
		}
	};
	Touch.prototype.update = function() {
		this.fireEventOnLastSelectedObject(this);
		this.clear();
	};
	Touch.prototype.getHeight = function() {
		return 2;
	};
	Touch.prototype.getWidth = function() {
		return 2;
	};
	Touch.prototype.applyToObject = function(renderizable) {
		if ( !this.isDragging ) {
			if ( renderizable.onTouch || renderizable.onTouchEnd || renderizable.onTouchMove || renderizable.onDrag ) {
				if ( this.isOverPolygon(renderizable) && this.isOverPixelPerfect(renderizable) ) {
					this.selectedObject = renderizable;
				}
			}
		}
	};
	Touch.prototype._setTouch = function(touch) {
		this.x = touch.pageX - touch.target.offsetLeft;
		this.y = touch.pageY - touch.target.offsetTop;
		this.force = touch.force;
	};
	Touch.prototype.start = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this._setTouch(touch);
			this.events.start = touch;
		}
	};
	Touch.prototype.end = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this.events.end = touch;
			this.isDragging = false;
			this.selectedObject = null;
		}
	};
	Touch.prototype.move = function(event) {
		var touches = event.changedTouches;
		if ( touches.length ) {
			var touch = touches[0];
			this._setTouch(touch);
			this.events.move = touch;
		}
	};
	Touch.prototype.started = function() {
		return this.events.start;
	};
	Touch.prototype.moved = function() {
		return this.events.move;
	};
	Touch.prototype.ended = function() {
		return this.events.end;
	};
	Touch.prototype.any = function() {
		return this.started() || this.moved() || this.ended();
	};
	/**
	 * Executes the events of the selected object
	 * @method fireEventOnLastSelectedObject
	 * @private
	 */
	Touch.prototype.fireEventOnLastSelectedObject = function() {

		if ( this.selectedObject ) {
			if ( this.events.start ) {
				if ( this.selectedObject.onTouch ) {
					this.selectedObject.onTouch(this);
				}
				if ( this.selectedObject.onDrag ) {
					this.isDragging = true;
				}
			}
			if ( this.events.end && this.selectedObject.onTouchEnd ) {
				this.selectedObject.onTouchEnd(this);
			}
			if ( this.events.move ) {
				if ( this.selectedObject.onTouchMove ) {
					this.selectedObject.onTouchMove(this);
				}
				if ( this.isDragging ) {
					this.selectedObject.onDrag(this);
				}
			}
		}

	};
	/**
	 * Returns whether the mouse is over the given object
	 * @method isOverPixelPerfect
	 * @param {renderers.Renderizable} renderizable
	 * @param {OnLoopProperties} p
	 */
	Touch.prototype.isOverPixelPerfect = function( renderizable ) {
		if ( ! renderizable.onRender ) return;
		if ( ! renderizable._visible ) return;
		var ctx = M.offScreenContext,
			cnv = M.offScreenCanvas,
			camera = M.camera;
		ctx.save();
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		renderizable.onRender(ctx, cnv, camera.x, camera.y);
		var imgData = ctx.getImageData(this.x, this.y, 1, 1);
		if ( !imgData.data[3] ) return false;
		if ( imgData.data[0] ) return true;
		if ( imgData.data[1] ) return true;
		if ( imgData.data[2] ) return true;
		return false;
	},
	/**
	 * Returns whether the mouse is over the given renderizable or not
	 *
	 * @method isOverPolygon
	 * @param {renderers.Renderizable} renderizable
	 * @param {Camera} camera
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Touch.prototype.isOverPolygon = function (renderizable) {
		var camera = M.camera,
			x = this.x + camera.x,
			y = this.y + camera.y;
		if (renderizable._rotation) {
			this._x = x;
			this._y = y;
			return M.collisions.Polygon.haveCollided(renderizable, this);
		} else {
			if (renderizable.getBottom() < y) return false;
			if (renderizable.getTop() > y) return false;
			if (renderizable.getRight() < x) return false;
			if (renderizable.getLeft() > x) return false;
			return true;
		}
	};

	Touch.prototype.bind = function() {
		document.addEventListener("touchstart", touchStartHelper, false);
		document.addEventListener("touchend", touchEndHelper, false);
		document.addEventListener("touchmove", touchMoveHelper, false);
		M.setTouch(this);
	};

	Touch.prototype.unbind = function() {
		document.removeEventListener("touchstart", touchStartHelper);
		document.removeEventListener("touchend", touchEndHelper);
		document.removeEventListener("touchmove", touchMoveHelper);
		M.setTouch(null);
	};

	instance = new Touch();
	instance.bind();

})(window.Match);/**
 * @module Match
 */
(function( namespace ) {

	/**
	 * Provides utility methods for creating strings from RGB and RGBA colors
	 * and converting RGB to HEX
	 * @class Color
	 * @static
	 * @constructor
	 */
	function Color() {
	}
	/**
	 * Returns a String representing the specified rgb color
	 * @method rgb
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @return {String}
	 */
	Color.prototype.rgb = function(r, g, b) {
		return "rgb(" + [r, g, b].join(",") + ")";
	};
	/**
	 * Returns a String representing the specified rgba color
	 * @method rgba
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @param {byte} a
	 * @return {String}
	 */
	Color.prototype.rgba = function(r, g, b, a) {
		return "rgba(" + [r, g, b, a].join(",") + ")";
	};
	/**
	 * Converts an rgb color to hexa
	 * @method rgbToHex
	 * @param {byte} r
	 * @param {byte} g
	 * @param {byte} b
	 * @return {String}
	 */
	Color.prototype.rgbToHex = function(r, g, b) {
		return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	};
	/**
	 * Converts a number from 0 to 255 to hexa
	 * @method componentToHex
	 * @param {byte} c
	 * @return {String}
	 */
	Color.prototype.componentToHex = function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	};
	/**
	 * Converts an hexa to rgb
	 * @method hexToRgb
	 * @param {String} hex
	 * @return {String}
	 */
	Color.prototype.hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return this.rgb(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16));
	};
    /**
	 * Returns a transparent color
	 * @method alpha
	 * @return {String}
	 */
	Color.prototype.alpha = function() {
		return this.rgba(0, 0, 0, 0);
	};
	/**
	 * Returns a random rgb color
	 * @method random
	 * @return {String}
	 */
	Color.prototype.random = function() {
		var math = window.Math;
		return this.rgb(math.round(math.random() * 255), math.round(math.random() * 255), math.round(math.random() * 255));
	};
	/**
	 * Returns an object with the attributes r, g, b from the given argument
	 * @method random
	 * @param {String} rgbString a string containing rgb colors
	 * @return {String}
		 * @example 
				var orangeColorObject = M.color.rgbStringToObject("rgb(255, 200, 0)");
		 */
	Color.prototype.rgbStringToObject = function(rgbString) {

		var obj = new Object();

		if ( rgbString ) {
			var regexResult = rgbString.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
			if ( regexResult ) {
				obj.r = parseInt(regexResult[1]);
				obj.g = parseInt(regexResult[2]);
				obj.b = parseInt(regexResult[3]);
			}
		}

		return obj;

	};

	namespace.color = new Color();

})( window.Match );/**
 * @module Match
 */
(function(M) {

	/**
	 * Generates random values
	 *
	 * @class Random
	 * @constructor
	 */
	function Random() {
		this.math = window.Math;
	}
	/**
	 * Returns a random integer
	 *
	 * @method integer
	 * @param {int} from
	 * @param {int} to
	 * @return {int}
	 */
	Random.prototype.integer = function(from, to) {
		return this.math.floor(this.math.random() * ( to - from + 1) ) + from;
	};
	/**
	 * Returns a random decimal
	 * @method decimal
	 * @param {decimal} from
	 * @param {decimal} to
	 * @return {decimal}
	 */
	Random.prototype.decimal = function(from, to) {
		return this.math.random() * ( to - from) + from;
	};
	/**
	 * Returns a random bool
	 *
	 * @method boolean
	 * @return {Boolean}
	 */
	Random.prototype.bool = function() {
		return this.math.random() < 0.5;
	};
	/**
	 * Returns a random sign
	 *
	 * @method sign
	 * @return {int} 1 or -1
	 */
	Random.prototype.sign = function() {
		return this.bool() ? 1 : -1;
	};
	/**
	 * Returns a random boolean from a true chance percentage
	 *
	 * @method booleanFromChance
	 * @param {int} trueChancePercentage 0 to 100
	 * @return {Boolean}
	 */
	Random.prototype.booleanFromChance = function(trueChancePercentage) {
		return this.integer(0, 100) <= trueChancePercentage;
	};
	/**
	 * Returns a random rgb color
	 *
	 * @method color
	 * @return {String}
	 * @example "M.random.rgb(100,100,30)"
	 */
	Random.prototype.color = function() {
		return M.color.random();
	};
	/**
	 * Returns a 2d point from an area
	 *
	 * @method area
	 * @return {Object}
	 * @example "M.random.area(0, 0, 100, 10)"
	 */
	Random.prototype.area = function(minX, minY, maxX, maxY) {
		return {
			x: M.random.integer(minX, maxX),
			y: M.random.integer(minY, maxY)
		}
	};

	M.random = new Random();

})( window.Match );(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function NoPostProcess() {
	}

	NoPostProcess.prototype.run = function(context) {
		return context.canvas;
	};

	namespace.postProcess.NoPostProcess = NoPostProcess;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function GrayScale() {
	}

	GrayScale.prototype.run = function(context) {
		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height),
            d = imageData.data,
			l = d.length,
			i,
			r,
			g,
			b,
			v;
		for (i = 0; i < l; i += 4) {
			r = d[i];
			g = d[i+1];
			b = d[i+2];
			// CIE luminance for the RGB
			// The human eye is bad at seeing red and blue, so we de-emphasize them.
			v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			d[i] = d[i+1] = d[i+2] = v;
		}
        context.putImageData(imageData, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.GrayScale = GrayScale;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function Brightness(value) {
        if ( value == undefined ) throw new Error("Brightness has no constructor that takes no arguments. You must specify the brightness value");
		this.value = value;
	}

	Brightness.prototype.run = function(context) {
		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height),
            d = imageData.data;
		for (var i=0; i<d.length; i+=4) {
			d[i] += this.value;
			d[i+1] += this.value;
			d[i+2] += this.value;
		}
        
        context.putImageData(imageData, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.Brightness = Brightness;

})(window.M);

(function(namespace) {

	if ( !namespace.postProcess ) namespace.postProcess = {};

	function Convolute(matrix, opaque) {
		this.matrix = matrix;
		this.opaque = opaque;
	}

	Convolute.prototype.setSharpen = function() {
		this.matrix = [ 0, -1,  0, -1,  5, -1, 0, -1,  0 ];
	};

	Convolute.prototype.setBlur = function() {
		this.matrix = [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ];
	};

	Convolute.prototype.setContour = function() {
		this.matrix = [ 1, 1, 1, 1, 0.7, -1, -1, -1, -1 ];
	};

	Convolute.prototype.run = function(context) {
        if ( !this.matrix ) return;
		var side = Math.round(Math.sqrt(this.matrix.length));
		var halfSide = Math.floor(side/2);
        var imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		var src = imgData.data;
		var sw = imgData.width;
		var sh = imgData.height;
		// pad output by the convolution matrix
		var w = sw;
		var h = sh;
        //TODO: Create a buffer for destination
		var imageData = document.createElement("canvas").getContext("2d");
        imageData.canvas.width = imgData.width;
        imageData.canvas.height = imgData.height;
        var data = imageData.getImageData(0, 0, imgData.width, imgData.height);
		var dst = data.data;
		// go through the destination image pixels
		var alphaFac = this.opaque ? 1 : 0;
		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y*w+x)*4;
				// calculate the weighed sum of the source image pixels that
				// fall under the convolution matrix
				var r=0, g=0, b=0, a=0;
				for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
						var scy = sy + cy - halfSide;
						var scx = sx + cx - halfSide;
						if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
							var srcOff = (scy*sw+scx)*4;
							var wt = this.matrix[cy*side+cx];
							r += src[srcOff] * wt;
							g += src[srcOff+1] * wt;
							b += src[srcOff+2] * wt;
							a += src[srcOff+3] * wt;
						}
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
        context.putImageData(data, 0, 0);
		return context.canvas;
	};

	namespace.postProcess.Convolute = Convolute;

})(window.M);/**
 * @module Match
 */
(function(M) {

	/**
	 * A game layer is like an offscreen canvas where all renderizable objects, that is objects that implement an
	 * onRender method, are put together for rendering. Game layers can be applied properties like alpha or scaling.
	 * All rendering takes place in a buffer which result is then rendered to the main canvas.
	 * NOTE: You need at least one layer in your game
	 * @class GameLayer
	 * @constructor
	 */
	function GameLayer(name, zIndex) {
		/**
		 * Array of Renderizables
		 * @property onRenderList
		 * @private
		 * @type Array
		 */
		this.onRenderList = [];
		/**
		 * Determines whether this layer needs to be redrawn or not
		 */
		this.needsRedraw = true;
		/**
		 * Determines whether the objects in this layer needs to be sorted again
		 */
		this.needsSorting = false;
		/**
		 * object rotation
		 * @property rotation
		 * @type float
		 * @example
				this.rotation = Math.PI;
		 */
        this.rotation = null;
		/**
		 * object scale factor
		 * @property scale
		 * @type Object
		 * @example
				this.scale = { x: 1, y: 1 };
		 */
        this.scale = null;
		/**
		 * Composite operation.
		 * Possible values: "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "darker" | "copy" | "xor"
		 * @property operation
		 * @type String
		 * @example
				this.operation = "source-in";
		 */
		this.operation = null;
		/**
		 * object transparency
		 * @property alpha
		 * @type float value must be between 0 and 1
		 * @example
				this.alpha = 0.5;
		 */
		this._alpha;
		/**
		 * object visibility. Determines whether the object will be rendered or not
		 * @private
		 * @property _visible
		 * @type Boolean
		 */
		this._visible = true;
		/**
		 * Parrallax factor is used for parralax scrolling. The object x and y coordinates are multiplied by the camera position to translate the scene in different speeds
		 * @property parrallaxFactor
		 * @type Object object that contains floats x and y
		 * @default {x: 1, y: 1}
		 * @example
				var layer = new M.GameLayer();
				layer.parrallaxFactor.x = 1.25; //Move faster in the x axis
		 */
		this.parrallaxFactor = {
			x: 1, y: 1
		}
		/**
		 * Array that contains animations for this object
		 * @private
		 * @property _onLoopAnimations
		 * @type Array
		 */
		this._onLoopAnimations = [];
		/**
		 * Name of the layer
		 * @property name
		 * @type String
		 */
		this.name = name || "layer" + M._gameLayers.length;
		/**
		 * z-index of this layer. Match uses this attribute to sort the layers
		 * @property _zIndex
		 * @private
		 * @type {int}
		 */
		this._zIndex = zIndex || 0;

		this.background = null;

		this.TYPE = M.renderizables.TYPES.LAYER;

	}
	/**
	 * Loops through the animations of the object
	 * @private
	 * @method _loopThroughAnimations
	 */
	GameLayer.prototype._loopThroughAnimations = function() {
		var i = 0,
		l = this._onLoopAnimations.length;
		for (; i < l; i++) {
			if (!this._onLoopAnimations[i].onLoop()) {
				this._onLoopAnimations.splice(i, 1);
			}
		}
	};
	/**
	 * Sets the transparency of the object
	 * @method setAlpha
	 * @param {float} value alpha value to set. Must be between 0 and 1
	 */
	GameLayer.prototype.setAlpha = function(value) {
		this._alpha = value;
	};
	/**
	 * Gets the transparency of the object
	 * @method getAlpha
	 * @param {float} value alpha value
	 */
	GameLayer.prototype.getAlpha = function() {
		return this._alpha;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	GameLayer.prototype.fadeIn = function(seconds, onFinished) {
		this._onLoopAnimations.push(new M.effects.visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	GameLayer.prototype.fadeOut = function(seconds, onFinished) {
		this._onLoopAnimations.push(new M.effects.visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	GameLayer.prototype.continousFade = function (seconds, fadeOutFirst, min, max) {
		this._onLoopAnimations.push(new M.effects.visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Loops through every renderizable and renderizes it if it is visible
	 * @method onLoop
	 * @protected
	 * @param {Object} p contains information like if it is required to debug
	 * @return {HTMLCanvasElement} a canvas contaning the result of the rendering
	 */
	GameLayer.prototype.onLoop = function(p) {
	};
	/**
	 * Adds this layer to Match list of layers
	 * @method addToGame
	 * @example
			var layer = new M.GameLayer();
			layer.addToGame();
	 */
	GameLayer.prototype.addToGame = function() {
		M.pushGameLayer(this);
	};
	/**
	 * Tells the layer about a change in some attribute of one of its renderizables
	 * @method renderizableChanged
	 * @private
	 */
	GameLayer.prototype.renderizableChanged = function() {
		this.needsRedraw = true;
	};
	/**
	 * Tells the layer about a change in the z-index of one of its renderizables
	 * @method zIndexChanged
	 * @private
	 */
	GameLayer.prototype.zIndexChanged = function() {
		this.needsSorting = true;
	};
	/**
	 * Sets the z-index of this layer and makes Match sort the layers accordingly
	 * @method setZIndex
	 */
	GameLayer.prototype.setZIndex = function(value) {
		this._zIndex = value;
		M.sortLayers();
	};
	/**
	 * Returns the z-index of this layer
	 * @method getZIndex
	 */
	GameLayer.prototype.getZIndex = function() {
		return this._zIndex;
	};
	/**
	 * Pushes an object into the onRenderList
	 * @method push
	 * @param {renderers.Renderizable} object
	 * @param {String} key
	 * @param {int} zIndex
	 * @example
			this.push(new Sprite("ninja"), "ninja", 10);
	 */
	GameLayer.prototype.add = function(entity, key, zIndex) {

		if ( ! entity ) {
			throw new Error("Cannot push null entity to game layer");
		}

		if ( !entity.setZIndex ) {
			// M.logger.warn(M.getObjectName(entity) + " does not implement setZIndex method");
		}

		if ( !entity.getZIndex ) {
			// M.logger.warn(M.getObjectName(entity) + " does not implement getZIndex method");
		}

		if ( !entity._zIndex ) {
			entity._zIndex = this.onRenderList.length;
		}

		if ( entity.onLoad ) {
			entity.onLoad();
		}

		var self = this,
			onChange = function() {
				self.needsRedraw = true;
			};
		
		entity.views.eachValue(function(view) {
			view.addEventListener("attributeChanged", onChange);
		});

		this.needsSorting = true;

		this.onRenderList.push(entity);

		//TODO: We need to know which objects were added so if they were outside the viewport we must not re render
		this.needsRedraw = true;

		M.raise("gameObjectPushedToLayer", entity);

	};
	GameLayer.prototype.push = GameLayer.prototype.add;
	/**
	 * Sorts the onRenderList by the elements zIndex
	 * @method sort
	 */
	GameLayer.prototype.sort = function() {
		this.onRenderList.sort(this._sortFunction);
	};
	/**
	 * Sort logic based on zIndex
	 * @method _sortFunction
	 * @private
	 * @param {renderers.Renderizable} a
	 * @param {renderers.Renderizable} b
	 * @return {int} the difference between the zIndex of the given objects
	 */
	GameLayer.prototype._sortFunction = function(a, b) {
		return a._zIndex - b._zIndex;
	};
	/**
	 * Gets the first element from the onRenderList
	 * @method getFirst
	 * @return {renderers.Renderizable} the first game object in the list or null if the list is empty
	 */
	GameLayer.prototype.getFirst = function() {
		return this.getIndex(0);
	};
	/**
	 * Gets the element matching the provided index
	 * @method getIndex
	 * @return {renderers.Renderizable} the game object at the specified index or null if it is not in the list
	 */
	GameLayer.prototype.getIndex = function( index ) {
		try {
			return this.onRenderList[ index ];
		} catch (e) {
			return null;
		}
	};
	/**
	 * Gets the element matching the provided key
	 * @method get
	 * @param {String} key
	 * @return {renderers.Renderizable} the object matching the provided key or null if it is not in the list
	 * @example
	 
			var layer = new M.GameLayer(),
				ninja = new Sprite("ninja");
			
			layer.push(ninja, "ninja");
	 
			var theNinja = layer.get("ninja");
			
			alert(ninja == theNinja) //will yield true
			
	 */
	GameLayer.prototype.get = function(key) {

		if ( this.cache && this.cache.key == key ) {
			return this.cache;
		}

		var i = this.onRenderList.length, 
			current;

		while ( i-- ) {
			current = this.onRenderList[i];
			if ( key == current.key ) {
				this.cache = current;
				return current;
			}
		}
		
		return null;

	};
	/**
	 * Gets the last element from the onRenderList
	 * @method getLast
	 * @return {renderers.Renderizable} the last renderizable in the list or null if the list is empty
	 */
	GameLayer.prototype.getLast = function() {
		return this.getIndex( this.onRenderList.length - 1 );
	};
	/**
	 * Returns true if the element is in the onRenderList and false if not
	 * @method isonRenderList
	 * @return {Boolean} true if the object in in the list or false if not
	 */
	GameLayer.prototype.isOnRenderList = function(object) {
		return this.onRenderList.indexOf(object) != -1;
	};
	/**
	 * Removes an element from the onRenderList
	 * @method remove
	 * @param {renderers.Renderizable} object the object to remove
	 * @example
			//Create a sprite
			var ninja = new Sprite("ninja");
			
			//Add the sprite
			gameLayer.push(ninja);
			
			//Remove the sprite
			gameLayer.remove(ninja);
	 */
	GameLayer.prototype.remove = function( object ) {

		if ( ! object ) return;

		if ( typeof object == "string" ) {

			this.remove( this.get( object ) );

		} else {

			var i = this.onRenderList.indexOf( object );

			if ( i > -1 ) {
				
				this.onRenderList.splice( i, 1 );

				M.raise("gameObjectRemovedFromLayer", object);

			}

		}

		if ( object.onLoop ) {

			M.removeGameObject( object );

		}

		object.ownerLayer = null;

		this.needsRedraw = true;

	};
	/**
	 * Removes all elements from the onRenderList
	 * @method removeAll
	 */
	GameLayer.prototype.removeAll = function() {
		this.onRenderList = [];
	};

	M.GameLayer = M.Layer = GameLayer;

})(window.Match);/**
 * @module Match
 */
(function(M, EventListener) {

	/**
	 * Provides methods for loading sprites and spritesheets. The event listeners inform you how many resources where loaded so far, this is 
	 * useful for loading screens.
	 * 
	 * @class SpriteManager
	 * @static
	 * @constructor
	 */
	function SpriteManager() {
	
		/**
		 * The path where all sprites are located
		 * @property path
		 * @type String
		 */
		this.path = "";

		/**
		 * The amount of sprites remaining to load
		 * @property toLoad
		 * @readOnly
		 * @type int
		 */
        this.toLoad = 0;
		/**
		 * The totla amount of sprites to load
		 * @property total
		 * @readOnly
		 * @type int
		 */
        this.total = 0;
		/**
		 * EventListener that gets called whenever a sprite is finished loading
		 * @property onImageLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				//e = {image, remaining, total}
				M.sprites.onImagesLoaded.addEventListener(function(e) {
					loadingText.setText("Loaded " + (e.total - e.remaining) + " of " + e.total);
				});
		 */
		this.onImageLoaded = new EventListener();
		/**
		 * EventListener that gets called when all sprites of a pack are finished loading
		 * @property onAllImagesLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sprites.onAllImagesLoaded.addEventListener(function() {
					alert("All images are ready");
				});
		 */
		this.onAllImagesLoaded = new EventListener();
		/**
		 * EventListener that gets called whenever a sprite cannot be loaded
		 * @property onImageError
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sprites.onImagesLoaded.addEventListener(function(image) {
					alert("could not load image " + image);
				});
		 */
		this.onImageError = new EventListener();
		/**
		 * Map used to store sprites
		 */
		this.assets = {};

    }

    function onError() {

        M.sprites._imageError(this);

    }

    function onLoad() {

        M.sprites._imageLoaded(this);

    }

	/**
	 * Method that gets called after an image has finished loading
	 * @method _imageLoaded
	 * @private
	 * @param {HTMLImageElement} image
	 */
    SpriteManager.prototype._imageLoaded = function( image ) {

        this.toLoad--;

        if ( image.frames == undefined ) {

            image.frames = [{x:0, y: 0, width: image.width, height: image.height, halfWidth: image.width / 2, halfHeight: image.height / 2}];

        } else if ( image.tiles ) {

			var frames = new Array(),
				width = image.tiles.width,
				height = image.tiles.height,
				padding = image.tiles.padding || 0,
				columns = Math.floor(image.width / (width + padding)),
				lines = Math.floor(image.height / (height + padding)),
				column,
				line;

			for ( line = 0; line < lines; line++ ) {
				for ( column = 0; column < columns; column++ ) {
					var x = (padding + width) * column + padding,
						y = (padding + height) * line + padding;
					frames.push({
						x: x,
						y: y,
						width: width,
						height: height,
						halfWidth: width / 2,
						halfHeight: height / 2
					});
				}
			}

			image.frames = frames;

		} else {
		
 			for ( var i in image.frames ) {

				image.frames[i].halfWidth = image.frames[i].width / 2;
				image.frames[i].halfHeight = image.frames[i].height / 2;

			}
		
		}

        this.onImageLoaded.raise({image: image, name: image.getAttribute("data-name"), remaining: this.toLoad, total: this.total});

        if ( this.toLoad <= 0 ) this.onAllImagesLoaded.raise();

    };
	/**
	 * Method that gets called after an image has failed loading
	 * @method _imageError
	 * @private
	 * @param {HTMLImageElement} image
	 */
    SpriteManager.prototype._imageError = function( image ) {

        this.toLoad--;
		
		this.onImageError.raise(image);

        console.error("Could not load", image.src);

    };
	/**
	 * Loads images from a Map of String-Url or String-SpriteSheet
	 * @method load
	 * @param {Map<String, Url>|Map<String, Object>} images
	 * @param {Function} onFinished callback to execute when all images are loaded
	 * @param {Function} onProgress callback to execute when an image is loaded
	 * @example 
			M.SpriteManager.load({"sky": "/assets/sky.png"});
	 * @example 
			M.SpriteManager.load({"sky": "/assets/sky.png", "ground": "/assets/ground.png"});
	 * @example 
			M.SpriteManager.load({
				"sky": "/assets/sky.png",
				"ground": "/assets/ground.png",
				"ninja": {
					"source" : "/assets/ninja.png",
					//Array of frames that compose this spritesheet
					"frames" : [{
							"x" : 10,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}, {
							"x" : 110,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}, {
							"x" : 210,
							"y" : 10,
							"width" : 90,
							"height" : 14
						}
					],
					//Map of animations
					"animations" : {
						"jump": {
							"duration" : 250,
							"frames" : [0, 1, 2] //Index of the frames that compose this animation
						}
					}
				});
	 * @example
			M.SpriteManager.load([
				"assets/sprites/sky.json",
				"assets/sprites/sun.json",
				"assets/sprites/ground.json"
			]);
	 */
    SpriteManager.prototype.load = function( map, onFinished, onProgress ) {
	
		var current, img, i;

		if ( onFinished ) {
			this.onAllImagesLoaded.addEventListener(onFinished);
		}
		if ( onProgress ) {
			this.onImageLoaded.addEventListener(onProgress);
		}

		if ( map instanceof Array ) {
		
			var jsonMap = {},
				loaded = 0,
				self = this,
				onJsonReceived = function(response) {
					var json = JSON.parse(response);
					jsonMap[json.name] = json;
					loaded++;
					if ( loaded >= map.length ) {
						self.load(jsonMap);
					}
				};
			
			for ( i = 0; i < map.length; i++ ) {
				
				M.Ajax.post(map[i], onJsonReceived);
				
			}
		
		} else {
		
			var alreadyLoaded = 0,
				count = 0;
		
			for ( i in map ) {
			
				count++;
				
				if ( ! this.assets[ i ] ) {
				

					current = map[i],
					img = new Image();

					img.setAttribute("data-name", i);
					img.onload = onLoad;
					img.onerror = onError;

					this.total = ++this.toLoad;

					if ( typeof current == "string" ) {

						img.src = this.path + current;

					} else {

						img.src = this.path + current.source;

						img.frames = current.frames;

						img.animations = current.animations;

					}

					this.assets[ i ] = img;

				} else {
					alreadyLoaded++;
				}

			}
			
			if ( alreadyLoaded == count ) {
				this.onAllImagesLoaded.raise();
			}
		
		}

    };
	/**
	 * Removes the sprite that matches the given id
	 * @method remove
	 * @param {String} id the sprite id
	 */
	SpriteManager.prototype.remove = function(id) {
		if ( this.assets[id] ) {
			delete this.assets[id];
			if ( this.total - 1 >= 0 ) {
				this.total--;
			}
			if ( this.toLoad - 1 >= 0 ) {
				this.toLoad--;
			}
		}
	};
	/**
	 * Removes all sprites
	 * @method removeAll
	 */
	SpriteManager.prototype.removeAll = function() {
		this.assets = {};
		this.total = 0;
		this.toLoad = 0;
	};
	/**
	 * Removes all event listeners
	 * @method removeAllEventListeners
	 */
	SpriteManager.prototype.removeAllEventListeners = function() {
		this.onImageLoaded = new EventListener();
		this.onAllImagesLoaded = new EventListener();
		this.onImageError = new EventListener();
	};

    M.SpriteManager = new SpriteManager();

    M.sprites = M.SpriteManager;

})(M, EventListener);/**
 * @module Match
 */
(function(M, EventListener) {

	/**
	 * Provides an interface for Audio. Holds a buffuer for simoultaneuisly playing the same sound.
	 * @class Sound
	 * @protected
	 * @constructor
	 */
	function Sound( name, url ) {

		/**
		 * Array containing the same sound multiple times. Used for playing the same sound simoultaneusly.
		 * @property audioBuffer
		 * @private
		 * @type Array
		 */
		this.audioBuffer = [];
		/**
		 * Sound source url
		 * @property src
		 * @private
		 * @type String
		 */
		this.src = url;
		/**
		 * @property name
		 * Name of the sound
		 * @private
		 * @type String
		 */
		this.name = name;

		this.increaseBuffer();

	}

	/**
	 * Max audio buffer size
	 * @property MAX_BUFFER
	 * @type int
	 */
	Sound.prototype.MAX_BUFFER = 3;
	/**
	 * Sets the current sound ready and calls onSoundLoaded
	 * @method setReady
	 * @private
	 */
	Sound.prototype.setReady = function() {
		this.canPlay = this.checkOk;
		if ( this.audioBuffer.length == 1 ) {
			M.sounds.onSoundLoaded.raise({sound: this, remaining: M.sounds.toLoad, total: M.sounds.total});
		}
	};
	/**
	 * Sets the current sound not ready and calls onSoundError
	 * @method setNotReady
	 * @private
	 */
	Sound.prototype.setNotReady = function() {
		this.canPlay = this.checkOk;
		M.sounds.onSoundError.raise({sound: this, remaining: M.sounds.toLoad, total: M.sounds.total});
	};
	/**
	 * Plays the current sound. If a sound like this is already playing then a new one is added to the
	 * buffer and played
	 * @method play
	 */
	Sound.prototype.play = function(loop) {

		if ( ! this.canPlay() ) return;

		var i = 0, current;

		while ( i < this.audioBuffer.length ) {

			current = this.audioBuffer[i];

			if ( current.ended || current.currentTime == 0 ) {
				current.loop = loop;
				current.play();
				return;
			}

			i++;

		}

		current = this.audioBuffer[0];
		current.pause();
		current.currentTime = 0;
		current.loop = loop;
		current.play();

		if ( this.audioBuffer.length < this.MAX_BUFFER ) {
			this.increaseBuffer();
		}

	};
	/**
	 * Stops plays the current sound
	 * @method stop
	 */
	Sound.prototype.stop = function() {

		if ( ! this.canPlay() ) return;

		this.each( function( obj ) {
            if ( obj.duration > 0 ) {
                obj.pause();
                obj.currentTime = 0;
            }
		});

	};
	/**
	 * Pauses the current sound
	 * buffer and played
	 * @method pause
	 */
	Sound.prototype.pause = function() {

		if ( ! this.canPlay() ) return;
		
		if(this.onNextPauseResume) {
			this.play();
			this.onNextPauseResume = false;
		} else {
			this.onNextPauseResume = this.isPlaying();
			this.each( function( obj ) {
				obj.pause();
			});
		}
	};
	/**
	 * Returns false
	 * @method checkFail
	 * @private
	 */
	Sound.prototype.checkFail = function() {
		return false;
	};
	/**
	 * Returns true
	 * @method checkOf
	 * @private
	 */
	Sound.prototype.checkOk = function() {
		return true;
	};
	/**
	 * Determines whether this sound can be played or not
	 * @method canPlay
	 * @type Boolean
	 */
	Sound.prototype.canPlay = function() {
		this.increaseBuffer();
		return false;
	};
	/**
	 * Sets the sound playback speed
	 * @method setPlaybackRate
	 * @param {int} rate
	 */
	Sound.prototype.setPlaybackRate = function(rate) {
		this.each( function( obj ) {
			obj.playbackRate = rate;
		});
	};
	/**
	 * Resets the sound playback speed to normal
	 * @method resetPlaybackRate
	 */
    Sound.prototype.resetPlaybackRate = function() {
        this.each( function( obj ) {
			obj.playbackRate = 1;
		});
    }
	/**
	 * Gets the sound playback speed
	 * @method getPlaybackRate
	 */
	Sound.prototype.getPlaybackRate = function() {
		return this.audioBuffer[0].playbackRate;
	};
	/**
	 * Determines whether the sound is paused or playing
	 * @method isPaused
	 */
	Sound.prototype.isPaused = function() {
		var i = 0; l = this.audioBuffer.length;
		for(; i < l; i++) {
			if ( this.audioBuffer[i].paused ) return true;
		}		
		return false;
	};
	/**
	 * Sets the volume of this sound
	 * @method setVolume
	 * @param volume
	 */
	Sound.prototype.setVolume = function( volume ) {

		this.each( function( obj ) {
			obj.volume = volume;
		});

	};
	/**
	 * Determines whether the sound is playing or not
	 * @method isPlaying
	 */
	Sound.prototype.isPlaying = function() {
		var i = 0; l = this.audioBuffer.length;
		for(; i < l; i++) {
			if( !this.audioBuffer[i].paused ) return true;
		}		
		return false;		
	};
	/**
	 * Executes the provided function using every sound in the buffer as parameter
	 * @method each
	 * @param {Function} func the function to execute
	 */
	Sound.prototype.each = function( func ) {

		var i = this.audioBuffer.length;

		while ( i-- ) {

			func( this.audioBuffer[i] );

		}

	};
	/**
	 * Increases the sound buffer provided the limit is not reached
	 * @method increaseBuffer
	 */
	Sound.prototype.increaseBuffer = function() {

		var sound = new Audio( this.src ),
			first = this.audioBuffer[0];

		sound.addEventListener("loadeddata", onloadeddata );
		sound.addEventListener("error", onerror );
		sound.name = this.name;

		if ( first ) {
			sound.muted = first.muted;
			sound.volume = first.volume;
		}

		this.audioBuffer.push( sound );

	};
	Sound.prototype.isMuted = function() {
		if ( this.audioBuffer.length > 0 ) {
			return this.audioBuffer[0].muted;
		}
		return false;
	};
	/**
	 * Toggles this sound on or off
	 * @method toggle
	 */
	Sound.prototype.toggle = function() {
		if ( this.isMuted() ) {
			this.unmute();
		} else {
			this.mute();
		}
	};
	/**
	 * Mutes this sound
	 * @method mute
	 */
	Sound.prototype.mute = function() {

		this.each( function( obj ) {
			obj.muted = true;
		});

	};
	/**
	 * Unmutes this sound
	 * @method unmute
	 */
	Sound.prototype.unmute = function() {

		this.each( function( obj ) {
			obj.muted = false;
		});

	};
	/**
	 * Sets this sound to loop
	 * @method setLoop
	 * @param {Boolean} value
	 */
	Sound.prototype.setLoop = function(value) {
		this.audioBuffer[0].loop = value;
	};

	var fakeFunc = function() {};
		fakeSound = {
            name: ""
        };

    for ( var i in Sound.prototype ) {
        if ( typeof Sound.prototype[i] == "function" ) {
            fakeSound[i] = fakeFunc;
        }
    }

	function onloadeddata() {
		M.sounds.assets[ this.name ].setReady();
		M.sounds.toLoad--;
		if(M.sounds.toLoad <= 0) {
			M.sounds.onAllSoundsLoaded.raise();
		}
	}

	function onerror() {
		console.warn( "Unable to load " + this.src );
        M.sounds.error = true;
		M.sounds.assets[ this.name ].setNotReady();
		M.sounds.toLoad--;
		if(M.sounds.toLoad <= 0) {
			M.sounds.onAllSoundsLoaded.raise();
		}
	}
	
	/**
	 * Provides methods for loading and playing sounds. The event listeners inform you how many resources where loaded so far, this is 
	 * useful for loading screens.
	 * 
	 * @example
			//To play a sound you must first load it using the SoundManager, once it is loaded you can access it by its key inside the SoundManager
			M.sounds.load("laser", "/sounds/laser");
			M.sounds.laser.play();
	 *
	 * @class SoundManager
	 * @static
	 * @constructor
	 */
	function SoundManager() {

		/**
		 * The path where all sounds are located
		 * @property path
		 * @type String
		 */
		this.path = "";
		/**
		 * The amount of sprites remaining to load
		 * @property toLoad
		 * @readOnly
		 * @type int
		 */
		this.toLoad = 0;
		/**
		 * The totla amount of sprites to load
		 * @property total
		 * @readOnly
		 * @type int
		 */
        this.total = 0;
		/**
		 * EventListener that gets called whenever a sound is finished loading
		 * @property onSoundLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				//e = {sound, remaining, total}
				M.sounds.onSoundLoaded.addEventListener(function(e) {
					loadingText.setText("Loaded " + (e.total - e.remaining) + " of " + e.total);
				});
		 */
		this.onSoundLoaded = new EventListener();
		/**
		 * EventListener that gets called when all sounds of a pack are finished loading
		 * @property onAllSoundsLoaded
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sounds.onAllSoundsLoaded.addEventListener(function() {
					alert("All sounds are ready");
				});
		 */
		this.onAllSoundsLoaded = new EventListener();
		/**
		 * EventListener that gets called whenever a sound cannot be loaded
		 * @property onSoundError
		 * @readOnly
		 * @type EventListener
		 * @example
				//Add a listener
				M.sounds.onSoundError.addEventListener(function(sound) {
					alert("could not load sound " + sound);
				});
		 */
		this.onSoundError = new EventListener();
		
		/**
		 * If there were errors while loading sounds this attribute becomes true
		 * @property error
		 * @readOnly
		 * @type Boolean
		 */
        this.error = false;
		/**
		 * Map used to store sounds
		 */
		this.assets = {};

	}
	/**
	 * Loads sounds from a Map of String-Url. The SoundManager determines what extension is best for the current browser
	 * so the extension is not required.
	 * @method load
	 * @param {Map<String, Url>} sounds
	 * @example
			//Let the SoundManager load the file with the most suitable extension for this browser
			M.SoundManager.load({
				"laser": "/sounds/laser",
				"talk": "/sounds/talk"
			});
	 * @example
			//Force loading an mp3 file
			M.SoundManager.load({
				"laser": "/sounds/laser.mp3",
				"talk": "/sounds/talk.mp3"
			});

	 */
	SoundManager.prototype.load = function(map, onFinished, onProgress) {
	
		if ( onProgress ) {
			this.onSoundLoaded.addEventListener(onProgress);
		}
		if ( onFinished ) {
			this.onAllSoundsLoaded.addEventListener(onFinished);
		}

		if ( map instanceof Array ) {
		
			var jsonMap = {},
				loaded = 0,
				self = this,
				onJsonReceived = function(response) {

					loaded++;
					
					var json = JSON.parse(response);
					
					jsonMap[json.name] = json.source;
					
					if ( loaded >= map.length ) {
						self.load(jsonMap);
					}
				
				};
			
			for ( var i = 0; i < map.length; i++ ) {
				
				M.Ajax.post(map[i], onJsonReceived);
				
			}
		
		} else {
		
			for ( var i in map ) {
				this.loadOne( i, map[i] );
			}
		
		}

	};
	/**
	 * Loads a sound from the given url and assigns it the provided name
	 * @method loadOne
	 * @param {String} name
	 * @param {String} url
	 * @example 
			//Load one file
			M.SoundManager.loadOne("footstep", "/sounds/footstep"});
	 */
	SoundManager.prototype.loadOne = function( name, url ) {

		this.total = ++this.toLoad;
		
		if ( M.browser.supportedAudioFormat == undefined ) {

			this.assets[ name ] = fakeSound;
			fakeSound.name = name;
			this.onSoundLoaded.raise({sound: fakeSound, remaining: M.sounds.toLoad--, total: M.sounds.total});
            
            if ( this.toLoad <= 0 ) {
                this.onAllSoundsLoaded.raise();
            }

		} else {

			if ( url.substr(0, 4) == "data" ) {
			
				this.assets[ name ] = new Sound( name, url );
				
			} else {
			
				if ( url.lastIndexOf(".") == -1 ) {
					url = url + M.browser.supportedAudioFormat;
				}
			
				this.assets[ name ] = new Sound( name, this.path + url );
				
			}


		}

		this.assets[ name ].name = name;

	};
	/**
	 * Pauses all sounds
	 * @method pause
	 * @example 
			M.SoundManager.pause();
	 */
	SoundManager.prototype.pause = function() {
		for ( var i in this.assets ) {
			this.assets[i].pause();
		}
	};
	/**
	 * Sets the volume of all sounds
	 * @method setVolume
	 * @param {float} value the volume value, must be between 0 and 1
	 * @example 
			M.SoundManager.setVolume(0.6);
	 */
	SoundManager.prototype.setVolume = function(value) {
		for ( var i in this.assets ) {
			this.assets[i].setVolume( value );
		}
	};
	/**
	 * Mutes all sounds
	 * @method mute
	 * @example 
			M.SoundManager.mute();
	 */
	SoundManager.prototype.mute = function() {
		for ( var i in this.assets ) {
			this.assets[i].mute();
		}
	};
	/**
	 * Unmutes all sounds
	 * @method mute
	 * @example 
			M.SoundManager.unmute();
	 */
	SoundManager.prototype.unmute = function() {
		for ( var i in this.assets ) {
			this.assets[i].unmute();
		}
	};
	/**
	 * Mutes or unmutes all sounds
	 * @method mute
	 * @example 
			M.SoundManager.mute();
	 */
	SoundManager.prototype.toggle = function() {
		for ( var i in this.assets ) {
			this.assets[i].toggle();
		}
	};
	/**
	 * Stops all sounds
	 * @method stop
	 * @example 
			M.SoundManager.stop();
	 */
	SoundManager.prototype.stop = function() {
		for ( var i in this.assets ) {
			this.assets[i].stop();
		}
	};
	/**
	 * Removes the sound that matches the given id
	 * @method remove
	 * @param {String} id the sound id
	 */
	SoundManager.prototype.remove = function(id) {
		if ( this.assets[id] ) {
			delete this.assets[id];
			if ( this.total - 1 >= 0 ) {
				this.total--;
			}
			if ( this.toLoad - 1 >= 0 ) {
				this.toLoad--;
			}
		}
	};
	/**
	 * Removes all sounds
	 * @method removeAll
	 */
	SoundManager.prototype.removeAll = function() {
		this.assets = {};
		this.toLoad = 0;
		this.total = 0;
	};

	SoundManager.prototype.removeAllEventListeners = function() {
		this.onSoundLoaded = new EventListener();
		this.onAllSoundsLoaded = new EventListener();
		this.onSoundError = new EventListener();
	};
	
	SoundManager.prototype.play = function(name, loop) {
		var sound = this.assets[name];
		if ( sound ) {
			sound.play(loop);
		}
	};

	SoundManager.prototype.stop = function(name) {
		var sound = this.assets[name];
		if ( sound ) {
			sound.stop();
		}
	};

	SoundManager.prototype.pause = function(name) {
		var sound = this.assets[name];
		if ( sound ) {
			sound.pause();
		}
	};

	SoundManager.prototype.getSound = function(name) {
		return this.assets[name];
	};

	M.SoundManager = M.sounds = new SoundManager();

})( Match, EventListener );(function (namespace) {
	
	/**
	 * @class Renderer
	 * @constructor
	 * @abstract
	 */
	function Renderer(canvas) {
		this.canvas = canvas;
		this.frontBuffer = null;
	}
	/**
	 * @method render
	 * @abstract
	 */
	Renderer.prototype.render = function() {
		throw new Error("Abstract method");
	};
	/**
	 * @method getCenter
	 */
	Renderer.prototype.getCenter = function() {
		return {x: this.canvas.width / 2, y: this.canvas.height / 2};
	};
	/**
	 * @method setSize
	 */
	Renderer.prototype.setSize = function( width, height ) {
		this.canvas.width = width;
		this.canvas.height = height;
	};
	/**
	 * @method getWidth
	 */
	Renderer.prototype.getWidth = function() {
		return this.canvas.width;
	};
	/**
	 * @method getHeight
	 */
	Renderer.prototype.getHeight = function() {
		return this.canvas.height;
	};
	/**
	 * @method adjustTo
	 * Stretches canvas to the given values.
	 */
	Renderer.prototype.adjustTo = function( width, height ) {
		this.canvas.style.setProperty("width", width + "px", null);
		this.canvas.style.setProperty("height", height + "px", null);
	};
	/**
	 * @method adjustToAvailSize
	 */
	Renderer.prototype.adjustToAvailSize = function() {
		this.canvas.adjustTo( window.screen.availWidth + "px", window.screen.availHeight + "px" );
	};
	/**
	 * @method resizeKeepingAspect
	 */
	Renderer.prototype.resizeKeepingAspect = function( times ) {
		this.canvas.adjustTo( this.canvas.width * times, this.canvas.height * times );
	};
	/**
	 * @method getRight
	 */
	Renderer.prototype.getRight = function() {
		return this.canvas.offsetLeft + this.canvas.offsetWidth;
	};
	/**
	 * @method getBottom
	 */
	Renderer.prototype.getBottom = function() {
		return this.canvas.offsetTop + this.canvas.offsetHeight;
	};
	/**
	 * @method getAvailWidth
	 */
	Renderer.prototype.getAvailWidth = function() {
		if ( this.canvas.getRight() < window.screen.availWidth ) { 
			return this.canvas.offsetWidth;
		} else {
			return window.screen.availWidth - this.canvas.offsetLeft;
		}
	};
	/**
	 * @method getAvailHeight
	 */
	Renderer.prototype.getAvailHeight = function() {
		if ( this.canvas.getBottom() < window.screen.availHeight ) { 
			return this.canvas.offsetHeight;
		} else {
			return window.screen.availHeight - this.canvas.offsetTop;
		}
	};
	/**
	 * @method getViewport
	 */
	Renderer.prototype.getViewport = function() {
		var viewport = {};
		if ( this.canvas.offsetLeft < 0 ) {
			viewport.left = -this.canvas.offsetLeft;
		} else {
			viewport.left = 0;
		}
		if ( this.canvas.offsetTop < 0 ) {
			viewport.top = -this.canvas.offsetTop;
		} else {
			viewport.top = 0;
		}
		if ( this.canvas.offsetLeft + this.canvas.offsetWidth > window.screen.availWidth ) {
			viewport.right = window.screen.availWidth - this.canvas.offsetLeft;
		} else {
			viewport.right = this.canvas.offsetWidth;
		}
		if ( this.canvas.offsetTop + this.canvas.offsetHeight > window.screen.availHeight ) {
			viewport.bottom = window.screen.availHeight - this.canvas.offsetTop;
		} else {
			viewport.bottom = this.canvas.offsetHeight;
		}
		return viewport;
	};
	/**
	 * Returns the aspect between the actual size of the canvas and the css size of it  
	 * @method getAspect
	 */
	Renderer.prototype.getAspect = function() {
		var aspect = { x: 1, y: 1 };
		if ( this.canvas.style.width && this.canvas.width != parseInt(this.canvas.style.width) ) {
			aspect.x = this.canvas.width / parseInt(this.canvas.style.width);
		}
		if ( this.canvas.style.height && this.canvas.height != parseInt(this.canvas.style.height) ) {
			aspect.y = this.canvas.height / parseInt(this.canvas.style.height);
		}
		return aspect;
	};
	/**
	 * Stretches the contents of the canvas to the size of the html document.
	 * This works as forcing a fullscreen, if the navigation bars of the browser were hidden.
	 *
	 * NOTE: This method behaves exactly as setCanvasStretchTo using document client width and height
	 *
	 * @method setCanvasStretch
	 * @param {Boolean} value true to stretch, false to set default values
	 */
	Renderer.prototype.setCanvasStretch = function(value) {
		if ( value ) {
			this.setCanvasStretchTo(document.documentElement.clientWidth, document.documentElement.clientHeight);
		} else {
			this.setCanvasStretchTo("auto", "auto");
		}
	};
	/**
	 * Stretches the contents of the canvas to the given size
	 *
	 * @method setCanvasStretchTo
	 * @param {String} w width in coordinates, as css pixels or percentages
	 * @param {String} h height in coordinates, as css pixels or percentages
	 */
	Renderer.prototype.setCanvasStretchTo = function(w, h) {
		if ( this.frontBuffer ) {
			if ( w ) {
				if ( typeof w == "number" || ( w != "auto" && w.indexOf("px") == "-1" && w.indexOf("%") == "-1" ) ) {
					w = w + "px";
				}
				this.frontBuffer.canvas.style.width = w;
			}

			if ( h ) {
				if ( typeof h == "number" || ( h != "auto" && h.indexOf("px") == "-1" && h.indexOf("%") == "-1" ) ) {
					h = h + "px";
				}
				this.frontBuffer.canvas.style.height = h;
			}
		}
	};
	
	Renderer.name = "Renderer";

	M.renderers = M.renderers || {};

	namespace.renderers.Renderer = Renderer;

})(M);(function (Renderer) {
	
	function StandardEntityRenderer(canvas) {

		this.extendsRenderer(canvas);

		this.frontBuffer = this.canvas.getContext("2d");
		
		this.backBuffer = document.createElement("canvas").getContext("2d");

		this.backBuffer.canvas.width = this.frontBuffer.canvas.width;
		this.backBuffer.canvas.height = this.frontBuffer.canvas.height;
		
		this.backBufferHalfWidth = this.backBuffer.canvas.width / 2;
		this.backBufferHalfHeight = this.backBuffer.canvas.height / 2;

		this.frontBuffer = this.canvas.getContext("2d");

		this.compositeOperations = [
			"source-over",
			"source-atop",
			"source-in",
			"source-out",
			"destination-atop",
			"destination-in",
			"destination-out",
			"destination-over",
			"lighter",
			"xor",
			"copy"
		];
	
		this.DEFAULT_COMPOSITE_OPERATION = 0;
		this.DEFAULT_ALPHA = 1;
		this.DEFAULT_SHADOW_OFFSET_X = this.frontBuffer.shadowOffsetX;
		this.DEFAULT_SHADOW_OFFSET_Y = this.frontBuffer.shadowOffsetY;
		this.DEFAULT_SHADOW_COLOR = this.frontBuffer.shadowColor;
		this.DEFAULT_SHADOW_BLUR = this.frontBuffer.shadowBlur;

		this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		this.shadowChanged = false;

		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;

		this._reRenderAllLayers = false;

		var self = this;

		this.camera = new M.Camera();
		this.camera.addEventListener("locationChanged", function () {
			self._reRenderAllLayers = true;
		});

		this.updateBufferSize();
		this.updateViewport();
		
	}
	StandardEntityRenderer.prototype.getContext = function() {
		return this.frontBuffer;
	};
	StandardEntityRenderer.prototype.getCanvas = function() {
		return this.frontBuffer.canvas;
	};
	/**
	 * Applies the operation of this object to the context as composite operation
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyOperation = function(object, context) {
		if ( object._compositeOperation ) {
			context.globalCompositeOperation = this.compositeOperations[object._compositeOperation];
			this.compositeOperation = object._compositeOperation;
		} else if (this.compositeOperation != this.DEFAULT_COMPOSITE_OPERATION) {
			this.resetOperation(context);
		}
	};
	/**
	 * @method resetOperation
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetOperation = function(context) {
		context.globalCompositeOperation = this.compositeOperations[this.DEFAULT_COMPOSITE_OPERATION];
		this.compositeOperation = this.DEFAULT_COMPOSITE_OPERATION;
	};
	/**
	 * Applies the alpha of this object to the provided context
	 *
	 * @method _applyOperation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyAlpha = function(object, context) {
		
		if ( object._alpha != undefined && object._alpha >= 0 && object._alpha <= 1 ) {
			if (  this.alpha != object._alpha ) {
				context.globalAlpha = this.alpha = object._alpha;
			}
		} else if ( this.alpha != this.DEFAULT_ALPHA ) {
			this.resetAlpha(context);
		}

	};
	/**
	 * @method resetAlpha
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetAlpha = function(context) {
		context.globalAlpha = this.alpha = this.DEFAULT_ALPHA;
	};
	/**
	 * Applies the shadow of this object to the provided context
	 *
	 * @method _applyShadow
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyShadow = function(object, context) {
		// if ( object._shadow ) {
		// 	var s = object._shadow;
		// 	context.shadowOffsetX = this.shadowOffsetX = s.x;
		// 	context.shadowOffsetY = this.shadowOffsetY = s.y;
		// 	context.shadowBlur = this.shadowBlur = s.blur;
		// 	context.shadowColor = s.color;
		// 	this.shadowChanged = true;
		// } else if (this.shadowChanged) {
		// 	this.resetShadow(context);
		// }

		context.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		context.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		context.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		context.shadowColor = this.DEFAULT_SHADOW_COLOR;
		
		if ( object._shadow ) {
			var s = object._shadow;
			context.shadowOffsetX = s.x;
			context.shadowOffsetY = s.y;
			context.shadowBlur = s.blur;
			context.shadowColor = s.color;
		}

	};
	/**
	 * @method resetShadow
	 * @abstract
	 */
	StandardEntityRenderer.prototype.resetShadow = function(context) {
		// if ( this.shadowChanged ) {
			// if ( this.shadowBlur != this.DEFAULT_SHADOW_BLUR ) {
			// 	context.shadowBlur = this.shadowBlur = this.DEFAULT_SHADOW_BLUR;
			// }
			// if ( this.shadowOffsetX != this.DEFAULT_SHADOW_BLUR ) {
			// 	context.shadowOffsetX = this.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
			// }
			// if ( this.shadowOffsetY != this.DEFAULT_SHADOW_OFFSET_Y ) {
			// 	context.shadowOffsetY = this.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
			// }
			// this.shadowChanged = false;
		// }

		context.shadowBlur = this.DEFAULT_SHADOW_BLUR;
		context.shadowOffsetX = this.DEFAULT_SHADOW_OFFSET_X;
		context.shadowOffsetY = this.DEFAULT_SHADOW_OFFSET_Y;
		context.shadowColor = this.DEFAULT_SHADOW_COLOR;

	};
	StandardEntityRenderer.prototype.setRenderingAlphaTime = function(alphaTime) {
		this._alphaTime = alphaTime;
		this._alphaTimeDif = 1 - alphaTime;
	};			
	StandardEntityRenderer.prototype.interpolate = function(current, previous) {
		return previous * this._alphaTime + current * this._alphaTimeDif;
	};
	StandardEntityRenderer.prototype._interpolateX = function(object) {
		return this.interpolate(object._x, object._prevX);
	};
	StandardEntityRenderer.prototype._interpolateY = function(object) {
		return this.interpolate(object._y, object._prevY);
	};
	StandardEntityRenderer.prototype._applyTranslation = function(object, context, cameraX, cameraY) {
		context.translate(object._x - cameraX, object._y - cameraY);
	};
	/**
	 * Applies the rotation of this object to the provided context
	 *
	 * @method _applyRotation
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyRotation = function(object, context) {
		if ( object._rotation ) {
			context.rotate(object._rotation);
		}
	};
	/**
	 * Applies the scale factor of this object to the provided context
	 *
	 * @method _applyScale
	 * @protected
	 * @param {StandardEntityRenderer} context
	 */
	StandardEntityRenderer.prototype._applyScale = function(object, context) {
		if ( object._scale ) {
			context.scale(object._scale.x, object._scale.y);
		}
	};
	/**
	 * Clears the given context
	 * @method clear
	 * @param {HTMLContext2d} context to clear
	 */
	StandardEntityRenderer.prototype.clear = function(context) {
		context.clearRect(0,0, context.canvas.width, context.canvas.height);
	};
	/**
	 * Renders the contents of the layers to the game canvas without using a middle buffer. This may result in flickering
	 * in some systems and does not allow applying properties to layers
	 * @method renderSingleBuffer
	 * @param {Array} gameLayerList array of game layers
	 * @param {CanvasRenderingContext2D} frontCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	StandardEntityRenderer.prototype.renderSingleBuffer = function(gameLayerList, frontCanvas, p) {

		/**
		 * Cache variables that are used in this function
		 */
		var l = gameLayerList.length,
			i = 0,
			f = this.frontBuffer;

		f.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {
			f.drawImage( gameLayerList[i].onLoop(p), 0, 0 );
		}

	};
	/**
	 * Renders the contents of the layers to the game canvas using a middle buffer to avoid flickering. Enables the use of layer properties
	 * @method renderDoubleBuffer
	 * @param {Array} gameLayerList array of game layers
	 * @param {CanvasRenderingContext2D} frontCanvas the canvas attached to the document where the game takes place
	 * @param {OnLoopProperties} p useful objects for performance increase
	 */
	StandardEntityRenderer.prototype.renderDoubleBuffer = function(gameLayerList, frontCanvas, p) {

		/*
		 * Cache variables that are used in this function
		 */
		var l = gameLayerList.length,
			i = 0,
			currentLayer,
			backBuffer = this.backBuffer;

		backBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		for ( ; i < l; i++ ) {

			currentLayer = gameLayerList[i];

			var result = currentLayer.onLoop(p);

			backBuffer.save();

			if ( currentLayer.composite ) {
				backBuffer.globalCompositeOperation = currentLayer.composite;
			}

			if ( currentLayer._alpha != null && currentLayer._alpha >= 0 && currentLayer._alpha <= 1 ) {
				backBuffer.globalAlpha = currentLayer._alpha;
			}

			var hW = this.backBufferHalfWidth,
				hH = this.backBufferHalfHeight;

			// var hW = ~~(this.backBufferHalfWidth + 0.5),
			// 	hH = ~~(this.backBufferHalfHeight + 0.5);


			backBuffer.translate(hW, hH);

			if ( currentLayer.rotation ) {
				backBuffer.rotate(currentLayer.rotation);
			}

			if ( currentLayer.scale ) {
				backBuffer.scale(currentLayer.scale.x, currentLayer.scale.y);
			}

			backBuffer.drawImage( result, hW, hH);

			backBuffer.restore();

		}

		this.frontBuffer.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

		this.frontBuffer.drawImage( backBuffer.canvas, 0, 0 );

	};
	/**
	 * Updates the back buffer size to match the size of the game canvas
	 *
	 * @method updateBufferSize
	 */
	StandardEntityRenderer.prototype.updateBufferSize = function() {

		if ( this.backBuffer && this.frontBuffer ) {
			this.backBuffer.canvas.width = this.frontBuffer.canvas.width;
			this.backBuffer.canvas.height = this.frontBuffer.canvas.height;
			this.backBufferHalfWidth = this.backBuffer.canvas.width / 2;
			this.backBufferHalfHeight = this.backBuffer.canvas.height / 2;
		}
		
		if ( M.collisions.PixelPerfect ) {
			M.collisions.PixelPerfect.testContext.canvas.width = this.backBuffer.canvas.width;
			M.collisions.PixelPerfect.testContext.canvas.height = this.backBuffer.canvas.height;
		}

		this.updateViewport();

	};
	/**
	 * Updates the camera viewport to match the size of the game canvas
	 * @method updateViewport
	 */
	StandardEntityRenderer.prototype.updateViewport = function() {
		this.camera.setViewport( this.frontBuffer.canvas.width, this.frontBuffer.canvas.height );
	};
	StandardEntityRenderer.prototype.getViewportSize = function() {
		return { width: this.camera.viewportWidth, height: this.camera.viewportHeight };
	};
	StandardEntityRenderer.prototype.renderRectangle = function(renderizable, context, cameraX, cameraY) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);
			
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
			}
			
			context.fillRect( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );

			if ( renderizable._strokeStyle ) {

				if ( renderizable._lineWidth ) {
					context.lineWidth = renderizable._lineWidth;
				}

				context.strokeStyle = renderizable._strokeStyle;
				context.strokeRect( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			}

			context.restore();
		
		} else {
		
			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
			}
			
			// context.fillRect( renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );
			context.fillRect( M.fastRound(renderizable._x - renderizable._halfWidth - cameraX), M.fastRound(renderizable._y - renderizable._halfHeight - cameraY), renderizable._width, renderizable._height );
			
			if ( renderizable._strokeStyle ) {

				if ( renderizable._lineWidth ) {
					context.lineWidth = renderizable._lineWidth;
				}

				context.strokeStyle = renderizable._strokeStyle;
				context.strokeRect( renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );

			}

		}

		this._applyShadow(renderizable, context);
		
	};
	/**
	 * Renders the current text in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderText = function( renderizable, context, cameraX, cameraY ) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		//TODO: caching oportunity
		context.font = renderizable._style + renderizable._variant + renderizable._weight + renderizable._size + renderizable._family;

		context.textAlign = renderizable._textAlign;

		context.textBaseline = renderizable._textBaseline;
		
		this._applyShadow(renderizable, context);

		if ( renderizable._halfWidth == 0 ) {
			renderizable.getWidth();
		}
		if ( renderizable._halfHeight == 0 ) {
			renderizable.getHeight();
		}

		if ( renderizable._rotation || renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			this.fillText(renderizable, context, -renderizable._halfWidth, -renderizable._halfHeight);

			context.restore();

		} else {

			this.fillText(renderizable, context, renderizable._x - renderizable._halfWidth, renderizable._y - renderizable._halfHeight);

		}

	};
	StandardEntityRenderer.prototype.fillText = function(renderizable, context, x , y) {

		context.fillStyle = renderizable._fillStyle;
		
		if ( renderizable.multiLine ) {
			for ( var i = 0; i < renderizable.multiLine.length; i++ ) {
				context.fillText( renderizable.multiLine[i], x, y + i * renderizable.getHeight() );
			}
		} else {
			context.fillText( renderizable._text, x, y );
		}

		if ( renderizable._strokeStyle ) {
			context.strokeStyle = renderizable._strokeStyle;
			context.lineWidth = renderizable._lineWidth || 1;
			context.strokeText(renderizable._text, x, y );
		}

	};
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method onRender
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderCircle = function( renderizable, context, cameraX, cameraY ) {

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		if ( renderizable._scale ) {

			context.save();

			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyScale(renderizable, context);

			context.beginPath();
			context.arc( 0, 0, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
				context.fill();
			}

			context.restore();

		} else {

			context.beginPath();
			context.arc( renderizable._x - cameraX, renderizable._y - cameraY, renderizable._radius, renderizable._startAngle, renderizable._endAngle, false);
			context.closePath();

			if ( renderizable._fillStyle ) {
				context.fillStyle = renderizable._fillStyle;
				context.fill();
			}

		}

		this._applyShadow(renderizable, context);

		if ( renderizable._strokeStyle ) {

			if ( renderizable._lineWidth ) {
				context.lineWidth = renderizable._lineWidth;
			}
			
			context.strokeStyle = renderizable._strokeStyle;
			// context.stroke( -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );
			context.stroke();
			
		}

	};
	/**
	 * Renders the current sprite in the provided context
	 *
	 * @method renderSprite
	 * @param {CanvasRenderingContext2D} context
	 * @param {HTMLCanvasElement} canvas
	 * @param {int} cameraX
	 * @param {int} cameraY
	 */
	StandardEntityRenderer.prototype.renderSprite = function( renderizable, context, cameraX, cameraY ) {

		if ( ! renderizable._image ) return;
		
		renderizable._animate();

		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);

		var fX = renderizable.currentFrame.x,
			fY = renderizable.currentFrame.y;

		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			context.drawImage( renderizable._image, fX, fY, renderizable._width, renderizable._height, -renderizable._halfWidth, -renderizable._halfHeight, renderizable._width, renderizable._height );

			context.restore();

		} else {

			context.drawImage( renderizable._image, fX, fY, renderizable._width, renderizable._height, renderizable._x - renderizable._halfWidth - cameraX, renderizable._y - renderizable._halfHeight - cameraY, renderizable._width, renderizable._height );

		}

	};
	StandardEntityRenderer.prototype.renderBitmapText = function( renderizable, context, cameraX, cameraY ) {
	
		if ( ! renderizable._sprite ) return;
		
		this._applyOperation(renderizable, context);
		this._applyAlpha(renderizable, context);
		
		var text = renderizable._text,
			length = text.length,
			start = 0,
			frames = renderizable._sprite.frames,
			x,
			y;
		
		if ( renderizable._rotation || renderizable._scale ) {
		
			context.save();
			
			this._applyTranslation(renderizable, context, cameraX, cameraY);
			this._applyRotation(renderizable, context);
			this._applyScale(renderizable, context);

			x = -renderizable._halfWidth;
			y = -renderizable._halfHeight;
			
			for ( var i = 0; i < length; i++ ) {
			
				var currentFrame = frames[text[i]];
				
				context.drawImage( renderizable._sprite, currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height, x + start, y, currentFrame.width, currentFrame.height );
				
				start = start + currentFrame.width;
				
			}

			context.restore();

		} else {

			x = renderizable._x - cameraX - renderizable._halfWidth;
			y = renderizable._y - cameraY - renderizable._halfHeight;

			for ( var i = 0; i < length; i++ ) {
			
				var currentFrame = frames[text[i]];
				
				context.drawImage( renderizable._sprite, currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height, x + start, y, currentFrame.width, currentFrame.height );

				start = start + currentFrame.width;
				
			}
		

		}
		
	};
	StandardEntityRenderer.prototype.renderLayer = function (layer, cameraX, cameraY, viewportWidth, viewportHeight) {

		if ( !layer._visible ) return;

		// if ( this._reRenderAllLayers || layer.needsRedraw ) {

			var current,
				currentView,
				currentViews,
				canvas = this.backBuffer.canvas;

			if ( layer.background ) {
				if ( layer.background.src ) {
					this.backBuffer.drawImage(layer.background, 0, 0, canvas.width, canvas.height);
				} else {
					this.backBuffer.fillStyle = layer.background;
					this.backBuffer.fillRect(0, 0, canvas.width, canvas.height);
				}
			} else {
				this.backBuffer.clearRect(0, 0, canvas.width, canvas.height);
			}

			for ( var i = 0, l = layer.onRenderList.length; i < l; i++ ) {

				current = layer.onRenderList[i];
				currentViews = current.views._values;

				for ( var j = 0, jl = currentViews.length; j < jl; j++ ) {
			
					currentView = currentViews[j];

					var pFX = layer.parrallaxFactor.x,
						pFY = layer.parrallaxFactor.y;
			
					if ( this.camera.canSee(currentView, pFX, pFY) ) {
					
						this.render(currentView, this.backBuffer, cameraX * pFX, cameraY * pFY);
					
					}
				
				}

			}

			//TODO: Review post processing
			if ( layer.postProcessing ) {
				layer.postProcessing(this.backBuffer, this.frontBuffer, cameraX, cameraY);
			}

			//TODO: Review buffer. Layer should not know anything about rendering
			// if ( layer._buffer == undefined ) {
			// 	layer._buffer = document.createElement("canvas").getContext("2d");
			// 	layer._buffer.canvas.width = canvas.width;
			// 	layer._buffer.canvas.height = canvas.height;
			// }
			
			// layer._buffer.clearRect(0, 0, canvas.width, canvas.height);
			// layer._buffer.drawImage(canvas, 0, 0);
			
			// layer.needsRedraw = false;

			// if ( layer._alpha != undefined ) {
			// 	this.frontBuffer.globalAlpha = layer._alpha;
			// }

			this._applyOperation(layer, this.frontBuffer);
			this._applyAlpha(layer, this.frontBuffer);
			// this._applyTranslation(layer, this.frontBuffer, 0, 0);
			// this._applyRotation(layer, this.frontBuffer);
			// this._applyScale(layer, this.frontBuffer);

			// if ( layer._x != undefined && layer._y != undefined ) {
			// 	this.frontBuffer.rotate(layer._rotation);
			// }
			// if ( layer._rotation != undefined ) {
			// 	this.frontBuffer.rotate(layer._rotation);
			// }

			this.frontBuffer.drawImage(this.backBuffer.canvas, 0, 0);

			// if ( layer._rotation != undefined ) {
			// 	this.frontBuffer.rotate(0);
			// }

			// this.frontBuffer.globalAlpha = 1;
			
		// } else {
		
		// 	this.frontBuffer.drawImage(layer._buffer.canvas, 0, 0);
			
		// }

		// if ( this.needsSorting ) {
		// 	this.sort();
		// 	this.needsSorting = false;
		// }

	};
	StandardEntityRenderer.prototype.renderLayers = function(layers) {
		this.frontBuffer.clearRect(0, 0, this.backBuffer.canvas.width, this.backBuffer.canvas.height);
		for ( var i = 0, l = layers._values.length; i < l; i++ ) {
			this.renderLayer(layers._values[i], this.camera._x, this.camera._y, this.camera.viewportWidth, this.camera.viewportHeight);
		}		
		this._reRenderAllLayers = false;
	};
	StandardEntityRenderer.prototype.render = function(object, context, cameraX, cameraY) {

		var types = M.renderizables.TYPES;
		
		switch ( object.TYPE ) {
			case types.SPRITE:
				this.renderSprite(object, context, cameraX, cameraY);
				break;
			case types.BITMAP_TEXT:
				this.renderBitmapText(object, context, cameraX, cameraY);
				break;
			case types.TEXT:
				this.renderText(object, context, cameraX, cameraY);
				break;
			case types.RECTANGLE:
				this.renderRectangle(object, context, cameraX, cameraY);
				break;
			case types.CIRCLE:
				this.renderCircle(object, context, cameraX, cameraY);
				break;
			default:
				throw new Error("Unable to render object of type " + object.TYPE);
		}

	};
	/**
	 * Sets the antialiasing of the buffer
	 *
	 * @method setAntialiasing
	 * @param {Boolean} value
	 */
	StandardEntityRenderer.prototype.setAntialiasing = function(value) {
		this.frontBuffer.mozImageSmoothingEnabled = value;
		this.frontBuffer.webkitImageSmoothingEnabled = value;
		this.frontBuffer.imageSmoothingEnabled = value;
		
		this.backBuffer.mozImageSmoothingEnabled = value;
		this.backBuffer.webkitImageSmoothingEnabled = value;
		this.backBuffer.imageSmoothingEnabled = value;		
	};
	StandardEntityRenderer.prototype._getImageRenderingStyle = function() {
		var style = document.getElementById("match-image-quality");
		if ( style == undefined ) {
			style = document.createElement("style");
			style.setAttribute("id", "match-image-quality");
			style.type = "text/css";
			document.head.appendChild(style);
		}
		return style;
	};
	StandardEntityRenderer.prototype.prioritizeQuality = function() {
		this.setAntialiasing(true);
		this._getImageRenderingStyle().innerHTML = "canvas { -ms-interpolation-mode: bicubic; image-rendering: optimizeQuality; }";
	};
	StandardEntityRenderer.prototype.prioritizeSpeed = function() {
		this.setAntialiasing(false);
		this._getImageRenderingStyle().innerHTML = "canvas { -ms-interpolation-mode: nearest-neighbor; image-rendering: optimizeSpeed; }";
	};
	/**
	 * Gets the center of the layer
	 * @method getCenter
	 * @return {Object} object containing x and y
	 */
	StandardEntityRenderer.prototype.getSceneCenter = function() {
		return new M.math2d.Vector2d( this.frontBuffer.canvas.width / 2, this.frontBuffer.canvas.height / 2 );
	};
	/**
	 * Gets the contents of this layer as an image in base64
	 * @method getAsBase64Image
	 * @return {String} a string representing an image in base64
	 */
	StandardEntityRenderer.prototype.getAsBase64Image = function() {
		return this.frontBuffer.canvas.toDataURL();
	};
	/**
	 * Gets the contents of this layer as an html image
	 * @method getAsImage
	 * @return {HTMLImageElement} an image element with the result of this layer
	 */
	StandardEntityRenderer.prototype.getAsImage = function() {
		var img = new Image();
		img.src = this.getAsBase64Image();
		return img;
	};
	// /**
	 // * Sets the background of the buffer
	 // *
	 // * @method setBackground
	 // * @param {String} background a color, sprite name or null
	 // * @example
			// this.setBackground("black");
			// this.setBackground("rgb(0, 100, 100)");
			// this.setBackground("skySprite");
			// this.setBackground(); //sets default background
			// this.setBackground(""); //sets default background
	 // */
	// GameLayer.prototype.setBackground = function(background) {
		// if ( !background == "" && typeof background == "string" ) {
			// if ( M.sprites[background] ) {
				// this.clearImage = M.sprites[background]._image;
				// this.clear = this.clearUsingImage;
			// } else {
				// this.clearColor = background;
				// this.clear = this.clearUsingFillColor;
			// }
		// } else {
			// this.clear = this.clearUsingDefault;
		// }
	// };
	// /**
	 // * Gets the background of the buffer
	 // *
	 // * @method getBackground
	 // * @return {String} a css string representing the background
	 // */
	// GameLayer.prototype.getBackground = function() {
		// return this.buffer.canvas.getPropertyValue("background");
	// };

	M.extend(StandardEntityRenderer, Renderer);

	M.renderers.StandardEntityRenderer = StandardEntityRenderer;

})(M.renderers.Renderer);(function (namespace) {
	
	function RenderingProvider() {
	}

	RenderingProvider.prototype.isWebGLSupported = function() {
		return WebGLRenderingContext !== undefined;
	};

	RenderingProvider.prototype.getRenderer = function (canvas, mode) {
		if ( mode && mode.toLowerCase() == "webgl" && this.isWebGLSupported() ) {
			return this.getWebGLRenderer(canvas);
		} else {
			return this.getStandardEntityRenderer(canvas);
		}
	};
	RenderingProvider.prototype.getStandardRenderer = function (canvas) {
		return new M.renderers.StandardRenderer(canvas);
	};
	RenderingProvider.prototype.getStandardEntityRenderer = function (canvas) {
		return new M.renderers.StandardEntityRenderer(canvas);
	};

	RenderingProvider.prototype.getWebGLRenderer = function (canvas) {
		return new M.renderers.WebGLRenderer(canvas);
	};

	namespace.renderingProvider = new RenderingProvider();

})(M);/**
 * @module Match
 * @namespace renderers
 */
(function(M) {

	M.renderizables = {
		TYPES: {
			SPRITE: 0,
			LAYER: 1,
			BITMAP_TEXT: 2,
			TEXT: 3,
			RECTANGLE: 4,
			CIRCLE: 5
		}
	}

})(M);/**
 * @module Match
 * @namespace renderers
 */
(function(M, visual) {
	/**
	 * Provides basic behaviour for rendering game objects
	 *
	 * @class Renderizable
	 * @constructor
	 * @extends GameObjectWithEvents
	 * @param {Object} [properties] properties to construct this object
	 */
    function Renderizable(properties) {
    	this.extendsGameObject();
    	this.extendsEventHandler();
		/**
		 * X coordinate of the object
		 * @private
		 * @property _x
		 * @type float
		 */
        this._x = 0;
		/**
		 * Y coordinate of the object
		 * @private
		 * @property _y
		 * @type float
		 */
		this._y = 0;
		/**
		 * previous x coordinate of the object
		 * @private
		 * @property _prevX
		 * @type float
		 */
		this._prevX = 0;
		/**
		 * previous y coordinate of the object
		 * @private
		 * @property _prevY
		 * @type float
		 */
		this._prevY = 0;		
		/**
		 * object width
		 * @private
		 * @property _width
		 * @type float
		 */
		this._width = 0;
		/**
		 * object height
		 * @private
		 * @property _height
		 * @type float
		 */
        this._height = 0;
		/**
		 * object half width, used for faster rendering
		 * @private
		 * @property _halfWidth
		 * @type float
		 */
        this._halfWidth = 0;
		/**
		 * object half height, used for faster rendering
		 * @private
		 * @property _halfHeight
		 * @type float
		 */
        this._halfHeight = 0;
		/**
		 * object rotation
		 * @private
		 * @property _rotation
		 * @type float
		 */
        this._rotation = null;
		/**
		 * object scale factor
		 * @private
		 * @property _scale
		 * @type Object
		 * @example
				this._scale = { x: 1, y: 1 };
		 */
        this._scale = null;
		/**
		 * object visibility. Determines whether the object will be rendered or not
		 * @private
		 * @property _visible
		 * @type Boolean
		 */
        this._visible = true;
		/**
		 * Composite operation
		 * Possible values: "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "darker" | "copy" | "xor"
		 * @property operation
		 * @type String
		 * @example
				this.operation = "source-in"
			
		 */
		this.operation = null;
		/**
		 * object transparency
		 * @private
		 * @property _alpha
		 * @type float
		 */
		this._alpha = null;

		this._math = Math;
		this._math2d = M.math2d;
		
		this._cachedRotationForBoundingHalfWidth = 0;
		this._cachedRotationForBoundingHalfHeight = 0;
		this._cachedBoundingHalfWidth = null;
		this._cachedBoundingHalfHeight = null;
		
        this.set(properties);

	}
	/**
	 * @private
	 * @property _zIndex
	 * @type int
	 */
	Renderizable.prototype._zIndex = 0;
	/**
	 * Sets the properties of this object based on the given object
	 * @method set
	 * @param {Object} properties properties to construct this object
	 */
    Renderizable.prototype.set = function (properties) {
        if (!properties) return;
        var setter = "";
        for (var i in properties) {
            setter = "set" + i.charAt(0).toUpperCase() + i.substr(1);
            if (this[setter]) {
                this[setter](properties[i]);
            } else {
                this[i] = properties[i];
            }
        }
		return this;
    };
	/**
	 * Sets the transparency of the object
	 * @method setAlpha
	 * @param {float} value alpha value to set. Must be between 0 and 1
	 */
	Renderizable.prototype.setAlpha = function(value) {
		if ( value >= 0 && value <= 1 && this._alpha != value ) {
			this._alpha = value;
			this.raiseEvent("alphaChanged", value);
			this.raiseEvent("attributeChanged", "alpha");
		} else {
			this._alpha = null;
		}
		return this;
	};
	/**
	 * Gets the transparency of the object
	 * @method getAlpha
	 * @param {float} value alpha value
	 */
	Renderizable.prototype.getAlpha = function() {
		return this._alpha;
	};
	/**
	 * Loops through the animations of an object. When the animation
	 * is complete it is removed from the list.
	 * @method _loopThroughAnimations
	 * @private
	 */
	Renderizable.prototype._loopThroughAnimations = function () {

		function doLoop(item, index, list) {
			if ( item && !item.onLoop() ) {
				list.quickRemove(index);
			}
		}

		this.animations.each(doLoop);
		
		if ( this.chainedAnimations.size ) {
			if ( !this.chainedAnimations._list[this._currentChainedBehaviour].onLoop() ) {
				this._currentChainedBehaviour++;
			}
			if ( this._currentChainedBehaviour == this.chainedAnimations.size ) {
				this.chainedAnimations.removeAll();
				this._currentChainedBehaviour = 0;
			}
		}
		
	};
	/**
	 * Clears the animation loop
	 * @method clearAnimations
	 */
	Renderizable.prototype.clearAnimations = function () {
		this.animations = new Array();
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.fadeIn = function (seconds, onFinished) {
		this.animations.push(new visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.fadeOut = function (seconds, onFinished) {
		this.animations.push(new visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a continouse fade animation to this object
	 * @method continousFade
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Boolean} [fadeOutFirst] determines whether the animation will start fading in or out
	 * @param {int} [min] minumum alpha value, defaults to 0
	 * @param {int} [max] maximum alpha value, defaults to 1
	 */
	Renderizable.prototype.continousFade = function (seconds, fadeOutFirst, min, max) {
		this.animations.push(new visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Moves an object to the given coordinates in the provided seconds
	 * @method move
	 * @param {float} x the destination x coordinate
	 * @param {float} y the destination y coordinate
	 * @param {String} easingX Ease function name for x axis
	 * @param {String} easingY Ease function name for y axis
	 * @param {Boolean} loop Start over when reched destination
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.move = function (x, y, seconds, easingX, easingY, loop, onFinished) {
		this.animations.push(new visual.Easing(this, x, y, seconds, easingX, easingY, loop, onFinished));
		return this;
	};
	/**
	 * Scales an object up to the given values in the provided seconds
	 * @method scaleUp
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.scaleUp = function (x, y, seconds, onFinished) {
		this.animations.push(new visual.ScaleUp(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Scales an object down to the given values in the provided seconds
	 * @method scaleDown
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.scaleDown = function (x, y, seconds, onFinished) {
		this.animations.push(new visual.ScaleDown(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Makes an object twinkle the given amount of times in the duration provided
	 * @method twinkle
	 * @param {int} timesToTwinkle the amount of times the object will twinkle
	 * @param {int} durationInMilliseconds the duration, in milliseconds, the twinkle effect will last
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.twinkle = function (timesToTwinkle, durationInMilliseconds, onFinished) {
		this.animations.push(new visual.Twinkle(this, timesToTwinkle, durationInMilliseconds, onFinished));
		return this;
	};
	/**
	 * Rotates an object to the given angle in the provided seconds
	 * @method rotate
	 * @param {float} the destination angle
	 * @param {int} seconds the duration the rotation effect will take to reach the provided angle
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.rotate = function (angle, seconds, onFinished) {
		this.animations.push(new visual.Rotate(this, angle, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainWait = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.Wait(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade in animation to this object
	 * @method fadeIn
	 * @param {int} seconds time in seconds that the fade in will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainFadeIn = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.FadeIn(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a fade out animation to this object
	 * @method fadeOut
	 * @param {int} seconds time in seconds that the fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainFadeOut = function (seconds, onFinished) {
		this.chainedAnimations.push(new visual.FadeOut(this, seconds, onFinished));
		return this;
	};
	/**
	 * Adds a continouse fade animation to this object
	 * @method continousFade
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Boolean} [fadeOutFirst] determines whether the animation will start fading in or out
	 * @param {int} [min] minumum alpha value, defaults to 0
	 * @param {int} [max] maximum alpha value, defaults to 1
	 */
	Renderizable.prototype.chainContinousFade = function (seconds, fadeOutFirst, min, max) {
		this.chainedAnimations.push(new visual.ContinousFade(this, seconds, fadeOutFirst, min, max));
		return this;
	};
	/**
	 * Moves an object to the given coordinates in the provided seconds
	 * @method move
	 * @param {float} x the destination x coordinate
	 * @param {float} y the destination y coordinate
	 * @param {int} seconds time in seconds that the fade in and fade out will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainMove = function (x, y, seconds, easingX, easingY) {
		// this.chainedAnimations.push(new visual.Move(this, x, y, seconds, onFinished));
		this.chainedAnimations.push(new visual.Easing(this, x, y, seconds, easingX, easingY));
		return this;
	};
	/**
	 * Scales an object up to the given values in the provided seconds
	 * @method scaleUp
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainScaleUp = function (x, y, seconds, onFinished) {
		this.chainedAnimations.push(new visual.ScaleUp(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Scales an object down to the given values in the provided seconds
	 * @method scaleDown
	 * @param {float} x the destination width factor
	 * @param {float} y the destination height factor
	 * @param {int} seconds time in seconds that the scaling will take
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainScaleDown = function (x, y, seconds, onFinished) {
		this.chainedAnimations.push(new visual.ScaleDown(this, x, y, seconds, onFinished));
		return this;
	};
	/**
	 * Makes an object twinkle the given amount of times in the duration provided
	 * @method twinkle
	 * @param {int} timesToTwinkle the amount of times the object will twinkle
	 * @param {int} durationInMilliseconds the duration, in milliseconds, the twinkle effect will last
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainTwinkle = function (timesToTwinkle, durationInMilliseconds, onFinished) {
		this.chainedAnimations.push(new visual.Twinkle(this, timesToTwinkle, durationInMilliseconds, onFinished));
		return this;
	};
	/**
	 * Rotates an object to the given angle in the provided seconds
	 * @method rotate
	 * @param {float} the destination angle
	 * @param {int} seconds the duration the rotation effect will take to reach the provided angle
	 * @param {Function} onFinished function to call once the animation finishes
	 */
	Renderizable.prototype.chainRotate = function (angle, seconds, onFinished) {
		this.chainedAnimations.push(new visual.Rotate(this, angle, seconds, onFinished));
		return this;
	};
	/**
	 * Loops through the timers of the object
	 * @private
	 * @method _loopThroughTimers
	 */
    Renderizable.prototype._loopThroughTimers = function () {
        var i = 0,
        l = this._onLoopTimers.length;
        for (; i < l; i++) {
            this._onLoopTimers[i].onLoop();
        }
    };
	/**
	 * Adds a timer to this object and returns it
	 * @method addTimer
	 * @param {int} timeInMillis
	 * @param {Function} callback the function to call once per interval. If the callback function is a method of this object, then the context will become this object
	 * @returns {Timer} the newly created timer
	 */
    Renderizable.prototype.addTimer = function (timeInMillis, callback) {
        var timer = new M.Timer(timeInMillis, callback, this);
        this._onLoopTimers.push(timer);
        return timer;
    };
	/**
	 * Removes a timer from this object
	 * @method removeTimer
	 * @param {Function} callback the function to be removed
	 * @returns {Renderizable} returns itself
	 */
    Renderizable.prototype.removeTimer = function (callback) {
        this._onLoopTimers.splice(this._onLoopTimers.indexOf(this._getTimer(callback)), 1);
        return this;
    };
	/**
	 * Returns the timer that handles the given callback
	 * @method _getTimer
	 * @private
	 * @param {Function} callback the function assigned to the timer
	 * @returns {Timer} the timer or null
	 */
    Renderizable.prototype._getTimer = function (callback) {
        var i = 0,
        l = this._onLoopTimers.length;
        for (; i < l; i++) {
            if (this._onLoopTimers[i].callback == callback) return this._onLoopTimers[i];
        }
    };
	/**
	 * Sets the zIndex of this object
	 * @method setZIndex
	 * @param {int} value the zIndex
	 */
    Renderizable.prototype.setZIndex = function (value) {
		if ( this._zIndex != value ) {
			this._zIndex = value;
			this.raiseEvent("zIndexChanged", value);
			this.raiseEvent("attributeChanged", "zIndex");
		}
		return this;
    };
	/**
	 * Gets the zIndex of this object
	 * @method getZIndex
	 * @return {int} the zIndex
	 */
    Renderizable.prototype.getZIndex = function () {
        return this._zIndex;
    };
	/**
	 * Sets the visibility of this object
	 * @method setVisible
	 * @param {Boolean} value true if it is visible or false if it is not
	 */
    Renderizable.prototype.setVisible = function (value) {
    	if ( this._visible != value ) {
	        this._visible = value;
	        this.raiseEvent("visibilityChanged", value);
			this.raiseEvent("attributeChanged", "visibility");
    	}
		return this;
    };
	/**
	 * Sets the width of this object
	 * @method setWidth
	 * @param {float} value
	 */
    Renderizable.prototype.setWidth = function (value) {
    	//value = ~~(value+0.5);
		if ( this._width != value ) {
			this._width = value;
			this._halfWidth = value / 2;
			this.raiseEvent("widthChanged", value);
			this.raiseEvent("attributeChanged", "width");
		}
		return this;
    };
	/**
	 * Sets the height of this object
	 * @method setHeight
	 * @param {float} value
	 */
    Renderizable.prototype.setHeight = function (value) {
    	//value = ~~(value+0.5);
		if ( this._height != value ) {
			this._height = value;
			this._halfHeight = value / 2;
			this.raiseEvent("heightChanged", value);
			this.raiseEvent("attributeChanged", "height");
		}
		return this;
    };
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
    Renderizable.prototype.getWidth = function () {
        if (this._scale) {
            return this._width * this._scale.x;
        } else {
            return this._width;
        }
    };
    Renderizable.prototype.getBoundingHalfWidth = function () {
    	
    	if ( !this._rotation ) {
    		return this._halfWidth;
    	} else if ( this._cachedRotationForBoundingHalfWidth == this._rotation ) {
    		return this._cachedBoundingHalfWidth;
    	}

		var halfWidth = this._halfWidth,
			halfHeight = this._halfHeight,
			v1 = this._math2d.getRotatedVertexCoordsX(-halfWidth, -halfHeight, this._rotation),
			v2 = this._math2d.getRotatedVertexCoordsX(halfWidth, -halfHeight, this._rotation),
			v3 = this._math2d.getRotatedVertexCoordsX(halfWidth, halfHeight, this._rotation),
			v4 = this._math2d.getRotatedVertexCoordsX(-halfWidth, halfHeight, this._rotation),
			maxX = this._math.max(v1, v2, v3, v4);

		this._cachedBoundingHalfWidth = this._math.abs(maxX);
		this._cachedRotationForBoundingHalfWidth = this._rotation;

		return this._cachedBoundingHalfWidth;
    };
    Renderizable.prototype.getBoundingWidth = function () {
    	return this.getBoundingHalfWidth() * 2;
    };
    Renderizable.prototype.getBoundingHalfHeight = function () {

    	if ( !this._rotation ) {
    		return this._halfHeight;
    	} else if ( this._cachedRotationForBoundingHalfHeight == this._rotation ) {
    		return this._cachedBoundingHalfHeight;
    	}

		var halfWidth = this._halfWidth,
			halfHeight = this._halfHeight,
			v1 = this._math2d.getRotatedVertexCoordsY(-halfWidth, -halfHeight, this._rotation),
			v2 = this._math2d.getRotatedVertexCoordsY(halfWidth, -halfHeight, this._rotation),
			v3 = this._math2d.getRotatedVertexCoordsY(halfWidth, halfHeight, this._rotation),
			v4 = this._math2d.getRotatedVertexCoordsY(-halfWidth, halfHeight, this._rotation),
			maxY = this._math.max(v1, v2, v3, v4);

		this._cachedBoundingHalfHeight = this._math.abs(maxY);
		this._cachedRotationForBoundingHalfHeight = this._rotation;

		return this._cachedBoundingHalfHeight;

    };
    Renderizable.prototype.getBoundingHeight = function () {
    	return this.getBoundingHalfHeight() * 2;
    };
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
    Renderizable.prototype.getHeight = function () {
        if (this._scale) {
            return this._height * this._scale.y;
        } else {
            return this._height;
        }
    };
	/**
	 * Sets the width and height of this object. Behaves exactly as if calling setWidth(width); setHeight(height);
	 * @method setSize
	 * @param {float} the width
	 * @param {float} the height
	 */
    Renderizable.prototype.setSize = function (width, height) {
        this.setWidth(width);
		if ( height == undefined )  {
			this.setHeight(width);
		} else {
			this.setHeight(height);
		}
		return this;
    };
	/**
	 * Returns the width and height of this object
	 * @method getSize
	 */
    Renderizable.prototype.getSize = function () {
        return {width: this.getWidth(), height: this.getHeight()};
    };
	/**
	 * Sets the scale of this object. Behaves exactly as if calling setScaleX(x); setScaleY(y);
	 * @method setScale
	 * @param {float} the width factor, defaults to 1
	 * @param {float} the height factor, defaults to 1
	 */
    Renderizable.prototype.setScale = function (x, y) {
        if (!x && !y) return;
        if (!x) x = 1;
        if (!y) y = 1;
        this.setScaleX(x);
        this.setScaleY(y);
		return this;
    };
	/**
	 * Sets the scale width factor
	 * @method setScaleX
	 * @param {float} the width factor
	 */
    Renderizable.prototype.setScaleX = function (value) {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.y = 1;
		}
		if ( this._scale.x != value ) {
			this._scale.x = value;
			this.raiseEvent("scaleXChanged", value);
			this.raiseEvent("attributeChanged", "scaleX");
		}
		return this;
    };
	/**
	 * Sets the scale height factor
	 * @method setScaleY
	 * @param {float} the height factor
	 */
    Renderizable.prototype.setScaleY = function (value) {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = 1;
		}
		if ( this._scale.y != value ) {
			this._scale.y = value;
			this.raiseEvent("scaleYChanged", value);
			this.raiseEvent("attributeChanged", "scaleY");
		}
		return this;
	};
    Renderizable.prototype.offsetScale = function (x, y) {
    	this.offsetScaleX(x);
    	this.offsetScaleY(y);
    	return this;
    };
    Renderizable.prototype.offsetScaleX = function (x) {
    	return this.setScaleX(this.getScaleX() + x);
    };
    Renderizable.prototype.offsetScaleY = function (y) {
    	return this.setScaleY(this.getScaleY() + y);
    };
    Renderizable.prototype.getScaleX = function () {
	if ( !this._scale ) {
			return 1;
		}
		return this._scale.x;
	};
    Renderizable.prototype.getScaleY = function () {
		if ( !this._scale ) {
			return 1;
		}
		return this._scale.y;
	};
	/**
	 * Inverts the object in the x axis
	 * Note: Works exactly as invertX
	 * @method mirror
	 */
	Renderizable.prototype.mirror = function () {
		this.invertX();
		return this;
	};
	/**
	 * Inverts the object in the x axis
	 * @method invertX
	 */
    Renderizable.prototype.invertX = function () {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.x = -1;
		} else {
			this.setScaleX(this._scale.x * -1);
		}
		return this;
    };
	/**
	 * Inverts the object in the y axis
	 * @method invertY
	 */
    Renderizable.prototype.invertY = function () {
		if ( !this._scale ) {
			this._scale = new Object();
			this._scale.y = -1;
		} else {
			this.setScaleY(this._scale.y * -1);
		}
		return this;
    };
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
    Renderizable.prototype.getLeft = function () {
        if (this._scale) {
			return this._x - this.getBoundingHalfWidth() * this._scale.x;
        } else {
			return this._x - this.getBoundingHalfWidth();
        }
    };
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
    Renderizable.prototype.getRight = function () {
        if (this._scale) {
            return this._x + this.getBoundingHalfWidth() * this._scale.x;
        } else {
			return this._x + this.getBoundingHalfWidth();
        }
    };
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
    Renderizable.prototype.getTop = function () {
        if (this._scale) {
            return this._y - this.getBoundingHalfHeight() * this._scale.y;
        } else {
        	return this._y - this.getBoundingHalfHeight();
        }
    };
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
    Renderizable.prototype.getBottom = function () {
        if (this._scale) {
            return this._y + this.getBoundingHalfHeight() * this._scale.y;
        } else {
        	return this._y + this.getBoundingHalfHeight();
        }
    };
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
    Renderizable.prototype.setLeft = function (value) {
        if (this._scale) {
        	this.setX(value + this.getBoundingHalfWidth() * this._scale.x);
        } else {
        	this.setX(value + this.getBoundingHalfWidth());
        }
		return this;
    };
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
    Renderizable.prototype.setRight = function (value) {
        if (this._scale) {
            this.setX(value - this.getBoundingHalfWidth() * this._scale.x);
        } else {
            this.setX(value - this.getBoundingHalfWidth());
        }
		return this;
    };
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
    Renderizable.prototype.setTop = function (value) {
        if (this._scale) {
            this.setY(this._y = value + this.getBoundingHalfHeight() * this._scale.y);
        } else {
            this.setY(this._y = value + this.getBoundingHalfHeight());
        }
		return this;
    };
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
    Renderizable.prototype.setBottom = function (value) {
        if (this._scale) {
            this.setY(value - this.getBoundingHalfHeight() * this._scale.y);
        } else {
            this.setY(value - this.getBoundingHalfHeight());
        }
		return this;
    };
	/**
	 * Returns an object containing the x and y coordinates of the object
	 *
	 * @method getLocation
	 * @return Object
	 * @example
			{x: 100, y: 400}
	 */
    Renderizable.prototype.getLocation = function () {
		return {
			x: this._x,
			y: this._y
		};
    };
	/**
	 * Sets the x and y coordinates of the object
	 *
	 * @method setLocation
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
    Renderizable.prototype.setLocation = function (x, y) {
    	this.setX(x);
    	this.setY(y);
		return this;
    };
    /**
	 * Offsets the alpha value
	 *
	 * @method offsetAlpha
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetAlpha = function(offset) {
        this.setAlpha(this._alpha + offset);
		return this;
    };
    /**
	 * Offsets the rotation
	 *
	 * @method offsetRotation
	 * @param {float} offset
	 */
    Renderizable.prototype.offsetRotation = function(offset, pivotX, pivotY) {
        
        this.setRotation(this._rotation + offset);

		if ( pivotX != undefined || pivotY != undefined ) {

			var x = this._x - pivotX,
				y = this._y - pivotY,				
				rotatedX,
				rotatedY;
				
			if ( x != 0 || y != 0 ) {
				rotatedX = M.math2d.getRotatedVertexCoordsX(x, y, offset),
				rotatedY = M.math2d.getRotatedVertexCoordsY(x, y, offset);
				this.setLocation(rotatedX + pivotX, rotatedY + pivotY);
			}


		}

		return this;

    };
	/**
	 * Sets the rotation angle of this object
	 *
	 * @method setRotation
	 * @param {float} rotation the rotation angle
	 */
	Renderizable.prototype.setRotation = function (rotation) {
		
		if ( rotation != this._rotation ) {
		
			this._rotation = rotation;

			this.raiseEvent("rotationChanged", rotation);
			this.raiseEvent("attributeChanged", "rotation");
		
		}

		return this;

	};
	/**
	 * Gets the rotation angle of this object
	 *
	 * @method getRotation
	 * @return {float}
	 */
	Renderizable.prototype.getRotation = function () {
		return this._rotation;
	};
	/**
	 * Sets the x coordinate of this object
	 *
	 * @method setX
	 * @param {float} x the rotation angle
	 */
	Renderizable.prototype.setX = function (value) {
		//value = ~~(value+0.5);
		if ( value != this._x ) {
			this._prevX = this._x;
			this._x = value;
			this.raiseEvent("xChanged", value);
			this.raiseEvent("attributeChanged", "x");
		}
		return this;
	};
	/**
	 * Sets the y coordinate of this object
	 *
	 * @method setY
	 * @param {float} y the rotation angle
	 */
	Renderizable.prototype.setY = function (value) {
		//value = ~~(value+0.5);
		if ( value != this._y ) {
			this._prevY = this._y;
			this._y = value;
			this.raiseEvent("yChanged", value);
			this.raiseEvent("attributeChanged", "y");
		}
		return this;
    };
	Renderizable.prototype.remove = function () {
		this.ownerLayer.remove(this);
		return this;
	};
	/**
	 * Adds the given x and y coordinates to those of the object
	 *
	 * @method offset
	 * @param {float} x the x coordinate to add
	 * @param {float} y the y coordinate to add
	 */
    Renderizable.prototype.offset = function (x, y) {

   		this.offsetX(x);
    	this.offsetY(y);

		return this;

    };
	/**
	 * Adds the given x coordinate to that of the object
	 *
	 * @method offsetX
	 * @param {float} x the x coordinate to add
	 */
    Renderizable.prototype.offsetX = function (x) {
    	if ( x != 0 ) {
    		this.setX(this._x + x);
    	}
		return this;
    };
	/**
	 * Adds the given y coordinates to that of the object
	 *
	 * @method offsetY
	 * @param {float} y the y coordinate to add
	 */
    Renderizable.prototype.offsetY = function (y) {
    	if ( y != 0 ) {
    		this.setY(this._y + y);
    	}
		return this;
    };
	/**
	 * Centers the object at the given vector2d object
	 *
	 * @method centerAt
	 * @param {Vector2d} vector2d object containing x and y attributes
	 */
	Renderizable.prototype.centerAt = function (vector2d) {
		this.setLocation(vector2d.x, vector2d.y);
		return this;
    };
	/**
	 * Returns the x coordinate of this object that belongs to it's center
	 *
	 * @method getX
	 * @return {float}
	 */
    Renderizable.prototype.getX = function () {
        return this._x;
    };
	/**
	 * Returns the y coordinate of this object that belongs to it's center
	 *
	 * @method getY
	 * @return {float}
	 */
	 Renderizable.prototype.getY = function () {
        return this._y;
    };
	/**
	 * Returns the previous x coordinate
	 *
	 * @method getPrevX
	 * @return {float}
	 */
    Renderizable.prototype.getPrevX = function () {
        return this._prevX;
    };
	/**
	 * Returns the previous y coordinate
	 *
	 * @method getPrevY
	 * @return {float}
	 */
	 Renderizable.prototype.getPrevY = function () {
        return this._prevY;
    };
    /**
	 * Returns the biggest number between width and height
	 *
	 * @method getMaxSize
	 */
    Renderizable.prototype.getMaxSize = function() {
        return Math.max(this.getWidth(), this.getHeight());
    };
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Renderizable.prototype.toString = function() {
		return this.constructor.name;
    };

    Renderizable.name = "Renderizable";

    M.extend(Renderizable, M.GameObject);
    M.extend(Renderizable, EventHandler);

	M.renderizables.Renderizable = Renderizable;

})(Match, Match.effects.visual);/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable) {

	function Shape(properties) {
		this.extendsRenderizable(properties);
				/**
		 * Fill Style used to fill the shape. Can be a color, a pattern or a gradient
		 * @private
		 * @property _fillStyle
		 * @default "black"
		 * @type Object
		 * @example
				this._fillStyle = "black";
		 * @example
				this._fillStyle = "rgba(255,0,0,100)";
		 */
		this._fillStyle = "rgb(0,0,0)";
		/**
		 * Stroke Style
		 * @private
		 * @property _strokeStyle
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._strokeStyle = null;
		/**
		 * Line width used to render the borders of the shape
		 * @private
		 * @property _lineWidth
		 * @type String
		 * @example
				this._strokeStyle = "black";
		 * @example
				this._strokeStyle = "rgba(255,0,0,100)";
		 */
		this._lineWidth = 1;
	}

	/**
	 * Sets the style used to stroke the shape
	 *
	 * @method setStrokeStyle
	 * @param {Object} value the strokeStyle
	 * @example
			this.setStrokeStyle("rgb('255,0,0')");
	 * @example
			this.setStrokeStyle("Red");
	 */
	Shape.prototype.setStrokeStyle = function(value) {
		if ( this._strokeStyle != value ) {
			this._strokeStyle = value;
			this.raiseEvent("attributeChanged", "strokeStyle");
		}
		return this;
	};
	/**
	 * Returns the style used to stroke the shape
	 *
	 * @method getStrokeStyle
	 * @example
			this.getStrokeStyle();
	 */
	Shape.prototype.getStrokeStyle = function() {
		return this._strokeStyle;
	};
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setFillStyle
	 * @param {Object} value the fillStyle
	 * @example
			this.setFillStyle("rgb('255,0,0')");
	 * @example
			this.setFillStyle("Red");
	 * @example
			this.setFillStyle(aPattern);
	 * @example
			this.setFillStyle(aGradient);
	 */
	Shape.prototype.setFillStyle = function(value) {
		if ( this._fillStyle != value ) {
			this._fillStyle = value;
			this.raiseEvent("attributeChanged", "fillStyle");
		}
		return this;
	};
	/**
	 * Gets the fill style
	 * @method getFillStyle
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getFillStyle = function() {
		return this._fillStyle;
	};	
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setFill
	 * @param {Object} value the fillStyle
	 */
	Shape.prototype.setFill = Shape.prototype.setFillStyle;
	/**
	 * Gets the fill style
	 * @method getFill
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getFill = Shape.prototype.setFillStyle;
	/**
	 * Sets the style used to fill the shape
	 *
	 * @method setColor
	 * @param {Object} value the fillStyle
	 */
	Shape.prototype.setColor = Shape.prototype.setFillStyle;
	/**
	 * Gets the fill style
	 * @method getColor
	 * @return {String} the fillStyle
	 */
	Shape.prototype.getColor = Shape.prototype.getFillStyle;
	/**
	 * Gets the stroke style
	 * @method getStrokeStyle
	 * @return {String} the strokeStyle
	 */
	Shape.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Sets the border color of the shape
	 *
	 * @method setBorder
	 * @param {Object} value the color of the border
	 * @example
			this.setBorder("rgb('255,0,0')");
	 * @example
			this.setBorder("Red");
	 */
	Shape.prototype.setBorder = Shape.prototype.setStrokeStyle;
	/**
	 * Sets the line width used to stroke the shape
	 *
	 * @method setStrokeWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Shape.prototype.setStrokeWidth = function(value) {
		if ( this._lineWidth != value ) {
			this._lineWidth = value;
			this.raiseEvent("strokeWidthChanged", value);
		}
		return this;
	};
	/**
	 * Sets the line width used to stroke the shape
	 *
	 * @method setBorderWidth
	 * @param {int} value the strokeStyle
	 * @example
			this.setStrokeWidth(5);
	 */
	Shape.prototype.setBorderWidth = Shape.prototype.setStrokeWidth;
	/**
	 * Returns the style used to stroke the shape
	 *
	 * @method getBorder
	 * @example
			this.getStrokeStyle();
	 */
	Shape.prototype.getBorder = Shape.prototype.getStrokeStyle;
	/**
	 * Gets the stroke width
	 * @method getStrokeWidth
	 * @return {int} the strokeWidth
	 */
	Shape.prototype.getStrokeWidth = function() {
		return this._lineWidth;
	};
	/**
	 * Gets the stroke width
	 * @method getBorderWidth
	 * @return {int} the strokeWidth
	 */
	Shape.prototype.getBorderWidth = Shape.prototype.getStrokeWidth;
		/**
	 * Sets the shadow style for this shape
	 *
	 * @method setShadow
	 * @param {float} x displacent in x
	 * @param {float} y displacent in y
	 * @param {String} color
	 * @param {int} blur
	 */
	Shape.prototype.setShadow = function(x, y, color, blur) {
		this._shadow = {
			x: x, y: y, color: color || "black", blur: blur || 1
		}
		this.raiseEvent("shadowChanged", this._shadow);
	};
	/**
	 * Gets the shadow
	 * @method getShadow
	 * @return {Object} the shadow
	 */
	Shape.prototype.getShadow = function() {
		return this._shadow;
	};

	Shape.name = "Shape";
	
	M.extend(Shape, Renderizable);
	
	namespace.Shape = Shape;
	
})(Match.renderizables, Match, Match.renderizables.Renderizable);/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class Sprite
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function Sprite(img, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _image
		 * @type HTMLImageElement
		 */
		/**
		 * The current frame of the spritesheet
		 * @property currentFrame
		 * @protected
		 * @type Object
		 */
		 /**
		 * The name of the animation to play
		 * @property animationName
		 * @protected 
		 * @type Object
		 */
		 this.animationName = null;
		/**
		 * The animation to play
		 * @property _animation
		 * @protected
		 * @type Object
		 */
		 this._animation = null;
		 /**
		 * The index of the current frame
		 * @property _frameIndex
		 * @protected
		 * @type int
		 */
		 this._frameIndex = 0;
		 /**
		 * Indicates if the animation if playing
		 * @property isPlaying
		 * @type Boolean
		 */
		 this.isPlaying = false;
		 /**
		 * Time in milliseconds when the current frame started playing
		 * @property currentFrameStartInMillis
		 * @protected
		 * @type int
		 */
		
		if ( img ) this.setImage(img);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderizables.TYPES.SPRITE;
		
	}

	/**
	 * Sets the image of this Sprite
	 * 
	 * @method setImage
	 * @param {String} img the key of the image loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	Sprite.prototype.setImage = function( img, frameIndex ) {

		if ( !img ) throw new Error("Image cannot be null");

		if ( img instanceof Image ) {
			if ( !img.frames ) {
				img.frames = [{x:0, y: 0, width: img.width, height: img.height, halfWidth: img.width / 2, halfHeight: img.height / 2}];
			}
			this._image = img;
		} else {
			var sprt = spriteAssets[ img ];
			if ( sprt ) {
				this._image = sprt;
			} else {
				throw new Error("Image by id " + img + " not loaded");
			}
		}

        this.setFrameIndex(frameIndex);
		this.animationName = null;
		this._animation = null;
		this.isPlaying = false;

		return this;

	};
	Sprite.prototype.getImage = function() {
		return this._image;
	};
	Sprite.prototype.setFillStyle = Sprite.prototype.setImage;
	Sprite.prototype.getFillStyle = Sprite.prototype.getImage;
	Sprite.prototype.setFill = Sprite.prototype.setImage;
	Sprite.prototype.getFill = Sprite.prototype.getImage;
	Sprite.prototype.setSprite = Sprite.prototype.setImage;
	Sprite.prototype.getSprite = Sprite.prototype.getImage;
	/**
	 * Starts playing the animation
	 * 
	 * @method play
	 * @param {String} animationName the key of the animation to play
	 * @param {Boolean} [loop] if true the animation will loop
	 */
	Sprite.prototype.play = function( animationName, loop ) {

		if ( this._animation && this.animationName == animationName && this.isPlaying ) return;

		if ( !animationName && this._animation ) {

			this.isPlaying = true;

		} else {

			if ( !this._image ) throw new Error("No image selected");

			if ( !this._image.animations ) throw new Error("Image has no animations");

			if ( !this._image.animations[animationName] ) throw new Error("Image has no animation by name " + animationName);

			this._animation = this._image.animations[animationName];

			this.animationName = animationName;

			this._frameIndex = 0;

			this.isPlaying = true;

		}

		this.loop = loop || this._animation.loop;

		this.raiseEvent("animationPlaying");

	};
	/**
	 * Stops the animation
	 *
	 * @method stop
	 */
	Sprite.prototype.stop = function() {
		this.isPlaying = false;
	};
	/**
	 * Animates the object
	 *
	 * @method _animate
	 * @private
	 */
	Sprite.prototype._animate = function() {

		if ( this.isPlaying ) {
			
			var timeInMillis = M.getTime();

			if ( ! this.currentFrameStartInMillis ) this.currentFrameStartInMillis = timeInMillis;

			if ( timeInMillis - this.currentFrameStartInMillis > this._animation.duration ) {

				this.currentFrame = this._image.frames[this._animation.frames[this._frameIndex]];

				if ( this._frameIndex < this._animation.frames.length - 1 ) {

					this.setFrameIndex(this._frameIndex + 1);

				} else {

					if ( this.loop ) {

						if ( this._frameIndex == 0 ) {

							this.setFrameIndex(1);

						} else {

							this.setFrameIndex(0);

						}

					} else {

						if ( this._animation.next ) {
							this.play(this._animation.next);
						} else {
							this.isPlaying = false;
						}

					}

				}

				this.currentFrameStartInMillis = timeInMillis;

			}

		}

	};
	/**
	 * Returns whether the current frame is the last frame of the animation
	 *
	 * @method isLastAnimationFrame
	 * @return {Boolean} true if current frame is the last of the animation
	 */
	Sprite.prototype.isLastAnimationFrame = function() {

		if ( this._animation ) {
			return this._frameIndex == this._animation.frames.length - 1;
		}

		return false;

	};
	/**
	 * Returns whether the current frame is the first frame of the animation
	 *
	 * @method isFirstAnimationFrame
	 * @return {Boolean} true if current frame is the first of the animation
	 */
	Sprite.prototype.isFirstAnimationFrame = function() {

		if ( this._animation ) {
			return this._frameIndex == 1;
		}

		return false;

	};
    /**
	 * Sets the index of the frame to render
	 *
	 * @method setFrameIndex
	 * @return {integer} the index to render
	 */
    Sprite.prototype.setFrameIndex = function(index) {
		index = index || 0;
        this._frameIndex = index;
        this.currentFrame = this._image.frames[index];
        this._width = this.currentFrame.width;
        this._height = this.currentFrame.height;
        this._halfWidth = this.currentFrame.halfWidth;
        this._halfHeight = this.currentFrame.halfHeight;
        this.raiseEvent("attributeChanged", "frame");
    };
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Sprite.prototype.toString = function() {
		return "Sprite";
    };
	
    Sprite.name = "Sprite";

	M.extend( Sprite, Renderizable );

	namespace.Sprite = Sprite;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	/**
	 * @class Rectangle
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Rectangle( properties ) {

		this.extendsShape();

		this.TYPE = M.renderizables.TYPES.RECTANGLE;

		this.set( properties );

	}
	
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Rectangle.prototype.toString = function() {
		return "Rectangle";
    };

    Rectangle.name = "Rectangle";

	M.extend(Rectangle, Shape);

	namespace.Rectangle = Rectangle;

})(Match.renderizables, Match, Match.renderizables.Shape);/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	/**
	 * @class Circle
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Circle( properties ) {

		this.extendsShape();

		/**
		 * Radius of the circle
		 * @private
		 * @property _radius
		 * @default 1
		 * @type float
		 */
		this._radius = 1;
		/**
		 * Angle in which to begin rendering the circle.
		 * Valid values: 0 to 2 * Math.PI
		 * @private
		 * @property _radius
		 * @default 0
		 * @type float
		 */
		this._startAngle = 0;
		/**
		 * Angle in which to end rendering the circle
		 * Valid values: 0 to 2 * Math.PI
		 * @private
		 * @property _radius
		 * @default 6.28
		 * @type float
		 */
		this._endAngle = 6.28;

		this.TYPE = M.renderizables.TYPES.CIRCLE;

		this.set( properties );

	}
	/**
	 * Sets the diameter of the circle
	 *
	 * @method setSize
	 * @param {float} size
	 */
	Circle.prototype.setSize = function(size) {
		return this.setRadius(size / 2);
	};
	/**
	 * Gets the diameter of the circle
	 *
	 * @method getSize
	 * @return {float} diameter
	 */
	Circle.prototype.getSize = function() {
		return this._radius * 2;
	};
	/**
	 * Sets the radius of the circle
	 *
	 * @method setRadius
	 * @param {float} radius
	 */
	Circle.prototype.setRadius = function(radius) {
		this._radius = radius;
		this.raiseEvent("attributeChanged");
	};
	/**
	 * Gets the radius of the circle
	 * @method getRadius
	 * @return {float} the shadow
	 */
	Circle.prototype.getRadius = function() {
		return this._radius;
	};
	/**
	 * Returns whether the mouse is over this object or not
	 *
	 * @method isMouseOver
	 * @param {Object} p M.onLoopProperties
	 * @return {Boolean} true if mouse is over this object else false
	 */
	Circle.prototype.isMouseOver = function( p ) {
		if ( ! p ) p = M.onLoopProperties;
		return M.Math2d.getDistance( {x: this._x, y: this._y }, p.mouse ) <= this._radius;
	};
	/**
	 * Gets the height of this object. This is actually an ellipsis so this method will return the width of the shape
	 * @method getWidth
	 * @return {float} the width
	 */
	Circle.prototype.getWidth = function() {
		if ( this._scale ) {
			return this._radius * 2 * this._scale.x;
		} else {
			return this._radius * 2;
		}
	};
	/**
	 * Gets the height of this object. This is actually an ellipsis so this method will return the height of the shape
	 * @method getWidth
	 * @return {float} the width
	 */
	Circle.prototype.getHeight = function() {
		if ( this._scale ) {
			return this._radius * 2 * this._scale.y;
		} else {
			return this._radius * 2;
		}
	};
	/**
	 * Returns x coordinate representing the leftmost part of the Object
	 *
	 * @method getLeft
	 * @return {float} the coordinates to left of the object
	 */
	Circle.prototype.getLeft = function() {
		if ( this._scale ) {
			return this._x - this._radius * this._scale.x;
		} else {
			return this._x - this._radius;
		}
	};
	/**
	 * Returns x coordinate representing the rightmost part of the Object
	 *
	 * @method getRight
	 * @return {float} the coordinates to right of the object
	 */
	Circle.prototype.getRight = function() {
		if ( this._scale ) {
			return this._x + this._radius * this._scale.x;
		} else {
			return this._x + this._radius;
		}
	};
	/**
	 * Returns y coordinate representing the topmost part of the Object
	 *
	 * @method getTop
	 * @return {float} the coordinates to top of the object
	 */
	Circle.prototype.getTop = function() {
		if ( this._scale ) {
			return this._y - this._radius * this._scale.y;
		} else {
			return this._y - this._radius;
		}
	};
	/**
	 * Returns y coordinate representing the bottommost part of the Object
	 *
	 * @method getBottom
	 * @return {float} the coordinates to bottom of the object
	 */
	Circle.prototype.getBottom = function() {
		if ( this._scale ) {
			return this._y + this._radius * this._scale.y;
		} else {
			return this._y + this._radius;
		}
	};
	/**
	 * Sets the leftmost coordinates of the Object
	 *
	 * @method setLeft
	 * @param {float} value the coordinates to left of the object
	 */
	Circle.prototype.setLeft = function(value) {
		if ( this._scale ) {
			this.setX(value + this._radius * this._scale.x);
		} else {
			this.setX(value + this._radius);
		}
	};
	/**
	 * Sets the rightmost coordinates of the Object
	 *
	 * @method setRight
	 * @param {float} value the coordinates to right of the object
	 */
	Circle.prototype.setRight = function(value) {
		if ( this._scale ) {
			this.setX(value - this._radius * this._scale.x);
		} else {
			this.setX(value - this._radius);
		}
	};
	/**
	 * Sets the topmost coordinates of the Object
	 *
	 * @method setTop
	 * @param {float} value the coordinates to top of the object
	 */
	Circle.prototype.setTop = function(value) {
		if ( this._scale ) {
			this.setY(this._y = value + this._radius * this._scale.y);
		} else {
			this.setY(value + this._radius);
		}
	};
	/**
	 * Sets the bottommost coordinates of the Object
	 *
	 * @method setBottom
	 * @param {float} value the coordinates to bottom of the object
	 */
	Circle.prototype.setBottom = function(value) {
		if ( this._scale ) {
			this.setY(value - this._radius * this._scale.y);
		} else {
			this.setY(value - this._radius);
		}
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Circle.prototype.toString = function() {
		return "Circle";
    };

    Circle.name = "Circle";

	M.extend(Circle, Shape);

	namespace.Circle = Circle;

})(Match.renderizables, Match, Match.renderizables.Shape);/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Shape) {

	var textMeasuringDiv = document.createElement("div");
		textMeasuringDiv.setAttribute("id", "match-text-measuring");
		textMeasuringDiv.style.setProperty("visibility", "hidden");
		textMeasuringDiv.style.setProperty("display", "inline-block");
		textMeasuringDiv.style.setProperty("position", "absolute");

	document.addEventListener( "DOMContentLoaded", function() {
		document.body.appendChild(textMeasuringDiv);
	});


	/**
	 * @class Text
	 * @constructor
	 * @extends renderers.Shape
	 * @param {Object} [properties] properties to construct this object
	 */
	function Text( properties ) {

		this.extendsShape();
		/**
		 * Font style
		 * @private
		 * @property _style
		 * @default "normal"
		 * @type String
		 * @example
				this._style = "normal";
		 * @example
				this._style = "italic";
		 * @example
				this._style = "bold";
		 */
		this._style = "";
		/**
		 * Font variant
		 * @private
		 * @property _variant
		 * @default "normal"
		 * @type String
		 * @example
				this._variant = "normal";
		 * @example
				this._variant = "small-caps";
		 */
		this._variant = "";
		/**
		 * Font weight
		 * @private
		 * @property _weight
		 * @default "normal"
		 * @type String
		 * @example
				this._weight = "normal";
		 * @example
				this._weight = "bold";
		 * @example
				this._weight = "bolder";
		 * @example
				this._weight = "lighter";
		 */
		this._weight = "";
		/**
		 * Font size
		 * @private
		 * @property _size
		 * @type String
		 * @example
				this._size = "10px";
		 */
		this._size = "14px";
		/**
		 * Font family
		 * @private
		 * @property _family
		 * @type String
		 * @example
				this._family = "Monospace";
		 */
		this._family = "Calibri, Verdana, Arial, Monospace";
		/**
		 * Text align
		 * @private
		 * @property _textAlign
		 * @default center
		 * @type String
		 * @example
				this._textAlign = "left";
		 * @example
				this._textAlign = "center";
		 * @example
				this._textAlign = "right";
		 * @example
				this._textAlign = "justify";
		 */
		this._textAlign = "left";
		/**
		 * Text baseline
		 * @private
		 * @property _textBaseline
		 * @default middle
		 * @type String
		 * @example
				this._textBaseline = "top";
		 * @example
				this._textBaseline = "bottom";
		 * @example
				this._textBaseline = "middle";
		 * @example
				this._textBaseline = "alphabetic";
		 * @example
				this._textBaseline = "hanging";
		 */
		this._textBaseline = "top";
		/**
		 * Text
		 * @private
		 * @property _text
		 * @default ""
		 * @type String
		 * @example
				this._textBaseline = "Hellow World!";
		 */
		this._text = "";

		this._changed = false;
		
		this.TYPE = M.renderizables.TYPES.TEXT;

		this.set( properties );

	}
	Text.prototype.getBoundingHalfWidth = function () {
		//Calculate and cache internal halfWidth and halfHeight which are needed for bounding method
		this.getWidth();
		this.getHeight();
		return this.shapeGetBoundingHalfWidth();
	};
	Text.prototype.getBoundingHalfHeigth = function () {
		//Calculate and cache internal halfWidth and halfHeight which are needed for bounding method
		this.getWidth();
		this.getHeight();
		return this.shapeGetBoundingHalfHeight();
	};
	/**
	 * Gets the height of this object
	 * @method getHeight
	 * @return {float} the height
	 */
	Text.prototype.getHeight = function() {
		
		if ( this._changed ) {

			textMeasuringDiv.style.setProperty("font-size", this._size);
			textMeasuringDiv.style.setProperty("font-family", this._family);
			textMeasuringDiv.style.setProperty("font-variant", this._variant);
			textMeasuringDiv.style.setProperty("font-weight", this._weight);
			textMeasuringDiv.style.setProperty("font-style", this._style);
			textMeasuringDiv.innerHTML = this._text;

			this._width = textMeasuringDiv.offsetWidth;
			this._height = textMeasuringDiv.offsetHeight;
			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;
		
			this._changed = false;

		}

		return this._height;

	};
	/*
	 * A Text size is too difficult to calculate so we
	 * just handle it's coordinates as we do with both
	 * of the objects, x and y is always center.
	 * That's why this methods are commented
	 */
	/**
	 * @deprecated
	 */
	Text.prototype.setAlignment = function( horizontal, vertical ) {
		this.setHorizontalAlign(horizontal);
		this.setVerticalAlign(vertical);
		this._changed = true;
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setHorizontalAlign = function(value) {
		this._textAlign = value;
		this._changed = true;
		this.raiseEvent("horizontalAlignChanged", value);
	};
	/**
	 * @deprecated
	 */
	Text.prototype.setVerticalAlign = function(value) {
		this._textBaseline = value;
		this._changed = true;
		this.raiseEvent("verticalAlignChanged", value);
	};
	/**
	 * Gets the width of this object
	 * @method getWidth
	 * @return {float} the width
	 */
	Text.prototype.getWidth = function() {

		if ( this._changed ) {

			textMeasuringDiv.style.setProperty("font-size", this._size);
			textMeasuringDiv.style.setProperty("font-family", this._family);
			textMeasuringDiv.style.setProperty("font-variant", this._variant);
			textMeasuringDiv.style.setProperty("font-weight", this._weight);
			textMeasuringDiv.style.setProperty("font-style", this._style);
			textMeasuringDiv.innerHTML = this._text;

			this._width = textMeasuringDiv.offsetWidth;
			this._height = textMeasuringDiv.offsetHeight;
			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;
		
			this._changed = false;

		}

		return this._width;

	};
	/**
	 * Sets the font family
	 *
	 * @method setFamily
	 * @param {String} value the font family
	 * @example
			this.setFamily("Monospace");
	 */
	Text.prototype.setFamily = function(value) {
		this._family = value;
		this._changed = true;
		this.raiseEvent("familyChanged", value);
	};

	Text.prototype.setFont = Text.prototype.setFamily;

	Text.prototype.getFont = Text.prototype.getFamily;
	/**
	 * Sets the font size
	 *
	 * @method setSize
	 * @param {String} value the font size without "px"
	 * @example
			this.setSize(14);
	 */
	Text.prototype.setSize = function(value) {
		this._size = parseInt(value) + "px ";
		this._changed = true;
		this.raiseEvent("sizeChanged", value);
	};
	/**
	 * Sets the font weight
	 *
	 * @method setWeight
	 * @param {String} value the font weight
	 * @example
			this.setWeight("normal");
	 * @example
			this.setWeight("bold");
	 * @example
			this.setWeight("bolder");
	 * @example
			this.setWeight("lighter");
	 */
	Text.prototype.setWeight = function(value) {
		this._weight = value + " ";
		this._changed = true;
		this.raiseEvent("weightChanged", value);
	};
	/**
	 * Makes the font bold or regular
	 *
	 * @method setBold
	 * @param {Boolean} value true or false to set font bold
	 * @example
			this.setBold(true);
	* @example
			this.setBold(false);
	 */
	Text.prototype.setBold = function(value) {
		if ( value ) {
			this.setWeight("bold");
		} else {
			this.setWeight("");
		}
		this._changed = true;
	};
	/**
	 * Sets the font variant
	 *
	 * @method setVariant
	 * @param {String} value the font variant
	 * @example
			this.setVariant("normal");
	 * @example
			this.setVariant("small-caps");
	 */
	Text.prototype.setVariant = function(value) {
		this._variant = value + " ";
		this._changed = true;
		this.raiseEvent("variantChanged", value);
	};
	/**
	 * Sets the font style
	 *
	 * @method setStyle
	 * @param {String} value the font style
	 * @example
			this.setStyle("normal");
	 * @example
			this.setStyle("italic");
	 * @example
			this.setStyle("bold");
	 */
	Text.prototype.setStyle = function(value) {
		this._style = value + " ";
		this._changed = true;
		this.raiseEvent("styleChanged", value);
	};
	/**
	 * Gets the font size
	 * @method getSize
	 * @return {int} the size
	 */
	Text.prototype.getSize = function(value) {
		return this._size;
	};
	/**
	 * Gets the font weight
	 * @method getWeight
	 * @return {String} the weight
	 */
	Text.prototype.getWeight = function(value) {
		return this._weight;
	};
	/**
	 * Gets the font variant
	 * @method getVariant
	 * @return {String} the variant
	 */
	Text.prototype.getVariant = function(value) {
		return this._variant;
	};
	/**
	 * Gets the font style
	 * @method getStyle
	 * @return {String} the style
	 */
	Text.prototype.getStyle = function(value) {
		return this._style;
	};
	/**
	 * Sets the text
	 * @method setText
	 * @param {String} value the text
	 */
	Text.prototype.setText = function(value, multiLine) {
		if ( multiLine ) {
			this.multiLine = value.split("\n");
		}
		this._text = value;
		this._changed = true;
		this.raiseEvent("textChanged", value);
	};
	/**
	 * Gets the font family
	 * @method getFamily
	 * @return {String} the family
	 */
	Text.prototype.getFamily = function(value) {
		return this._family;
	};
	/**
	 * Gets the text
	 * @method getText
	 * @return {String} the text
	 */
	Text.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    Text.prototype.toString = function() {
		return "Text";
    };

    Text.name = "Text";
    
	M.extend( Text, Shape );

	namespace.Text = Text;

})(Match.renderizables, Match, Match.renderizables.Shape);/**
 * @module Match
 * @namespace renderers
 */
(function(namespace, M, Renderizable, spriteAssets) {

	/**
	 * Contains an array of images that can be rendered to play an animation
	 *
	 * @class BitmapText
	 * @constructor
	 * @extends renderers.Renderizable
	 * @param {String} sprite the key of the image loaded by M.sprites
	 * @param {float} x the x coordinate
	 * @param {float} y the y coordinate
	 */
	function BitmapText(sprite, x, y) {

		this.extendsRenderizable();
		
		/**
		 * The image to render
		 * @private
		 * @property _sprite
		 * @type HTMLImageElement
		 */
		this._sprite = null;
		
		if ( sprite ) this.setSprite(sprite);
		
		this.setLocation(x || 0, y || 0);
		
		this.TYPE = M.renderizables.TYPES.BITMAP_TEXT;
		
	}

	/**
	 * Sets the sprite of this BitmapText
	 * 
	 * @method setSprite
	 * @param {String} sprite the key of the sprite loaded by M.sprites
	 * @param {int} frameIndex the starting frame index
	 */
	BitmapText.prototype.setSprite = function( sprite, frameIndex ) {

		if ( !sprite ) throw new Error("Image cannot be null");

		if ( sprite instanceof Image ) {
			if ( !sprite.frames ) {
				throw new Error("A bitmap font requires each font to be specified as a frame");
			}
			this._sprite = sprite;
		} else {
			var sprt = spriteAssets[ sprite ];
			if ( sprt ) {
				this._sprite = sprt;
			} else {
				throw new Error("Image by id " + sprite + " not loaded");
			}
		}

		this.raiseEvent("attributeChanged", "sprite");
		
		return this;

	};
	/**
	 * Gets the sprite of this BitmapText
	 * 
	 * @method getSprite
	 * @return {Image} the sprite used by this BitmapText
	 */
	BitmapText.prototype.getSprite = function() {
		return this._sprite;
	};
	BitmapText.prototype.setFillStyle = BitmapText.prototype.setSprite;
	BitmapText.prototype.getFillStyle = BitmapText.prototype.getSprite;
	BitmapText.prototype.setFill = BitmapText.prototype.setSprite;
	BitmapText.prototype.getFill = BitmapText.prototype.getSprite;
	BitmapText.prototype.setText = function(text) {

		if ( text != this._text ) {

			this._text = text;

			this._width = 0;
			this._height = 0;

			var i = 0,
				j = text.length,
				character;

			for ( var i = 0, j = text.length; i < j; i++ ) {

				character = this._sprite.frames[text[i]];

				if ( character == undefined ) {
					throw new Error("Character '" + text[i] + "' has not been defined for this BitmapText");
				}

				this._width += this._sprite.frames[text[i]].width;
				this._height = Math.max(this._height, this._sprite.frames[text[i]].height);

			}

			this._halfWidth = this._width / 2;
			this._halfHeight = this._height / 2;

			this.raiseEvent("attributeChanged", "text");

		}

		return this;

	};
	BitmapText.prototype.getText = function() {
		return this._text;
	};
	/**
	 * Returns the constructor's name
	 *
	 * @method toString
	 */
    BitmapText.prototype.toString = function() {
		return "BitmapText";
    };
	
	BitmapText.DEFAULT_FONT = {
		source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAb8AAAJBCAYAAADWY7uGAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB94BFxAECRXYT7kAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAE35JREFUeNrt3U1uGzsWgFFWoF15pEAzeeANGYn3ZM0E1MjwogSjepCU0nHiF0uqn0vec0YBGg8ts0h+KltFdcMwFP7UP3VDKaVsvw2d0cB8hLbm4+b8r5d7FZxC6+N499wZd/Mx3Xw0v5qzMQRctQlEiaBNyXyM/KYM8cOmI3qIIOKHTUf0EEHED5uO6CGCiB82HdFDBBE/6tt0+uOhlHLFR6JFj0jzkeZ8MQQAiB8AiB8AiB8AiB8AiB8AiB8AxBHmOb/x+ZupbXf7VBfUOMYex2zMR/NR/Ba2fTz9+Mfrg6tsHDEfIXb8vn4vk5y8MDyW1CeEGMeJNlsngZiP5mOT/M0PAPEDAPEDAPEDAPEDAPEDAPEDAPEDAPEDgMWEO+FleDsNLotxBEgRv/OZfRhH4Pd1HexYs/6pGyK+rjrv/BxUaxyBv3u595ucifmbHwDiBwDiBwDiBwB12xgCbtUfDwYBcOcHAO78aFrNz/oA7vxgcv1TN4wPxAK486MdHsAF3PkBgPgBgPgBgPgBwILCfOBlrgelt7t9qgtqHMG6pqL4Tb5Zj8+e+STibeM4fj+gr0oCxG+BaHGTr9/LJOM4PBZvHsD+2Bx/8wNA/ABA/ABA/ABA/ABA/ABA/ABA/ABA/ABgMb7MtlHD28nJLJiPIH45nM/i5LZxDHaMVP/UDRFfl/loPoofMTiAehoORDcfzcem+ZsfAOIHAOIHAOIHAOIHAOIHAOIHAIF4zo9Z9MfDJP/9drc3mKw+HxE/uGiTufYEiPG/O58kIYKsOB8RP1h0kxFBRA/xI+0mI4KIHuJH2k1GBBE9xI+0m4wIInpMEr9WPw219M+V5VNlUTaZ9xHEfDSOfCp+rW4aS/9cWTbfqO+sRdB8NI5cohsG1xaAXJzwAoD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4Lax/6gbn+rn+Xo91ZBzbfN2/vtLo5d4EXUNt43733BmXin4u69r15x/xQ/Qued1LRRBA/ERPBAHET/REEED8RE8EAcRP9EQQQPxEb8lx6I+HUkop22+DGAJheM4PAPEDAPEDAPEDAPEDAPEDAPEDgEDCPOc3Pg+GcQRw5wcArd75jZwEYhwB3PkBgPgBgPgBgPgBgPgBkF7/1A39UzeU4vv8AKjVDd+f6s4PgHTEDwDxAwDxA4DGhPnAS7TjuMZPBDkmLOc4uu4gfsu44VM7GH/jAVzCrz0BED8AED8AED8AED8AED8AED8AED8AWI+vNAKgLhMcQiF+AKSJnvgBkC564gdAuuiJHwDpohcufv3x4IIHHv/tbm88JpBtHCFa9Nz58WOT//l9ex9u1uP32vmKn9uiZxwhRPTCxs+XiBpv4wOi584PYGHjb0S8+WkveuIH2ByZ1flv3Ctfz7/9DV/8AGjzDv5d9P7/Tl78AEgTPfEDIF30xA+AdNETPwDSRU/8AEgXPfEDoGq3PIcpfgCkiZ74mRSAdZSW+LXGyRhgHWW5PnfPV79J+WIUAag2gle+URE/ANJFUPwASBdB8QMgXQTFD4B0EfRpTwBmMZ7EMj46cv6S4PF7/paM4LvXI34ALGL1CLrzW+CdzooXNdI4gHVkHUWMoPg1/M4mwmJ1UgbWkXUU8TqLn8VrsWIdWUfprrP4WbwWK9aRdZTuOoufxWuxYh1ZR+mus/hZvBYr1pF1lO46bz66GCx7UWt9/UttDq1Y+udqfV1bRzmu/xzXeVPrpLF4G12sjc7HpX+ubOvaOspx/ae8zt0waB8AuTjbEwDxAwDxAwDxAwDxAwDxAwDxAwDxAwDxAwDxA4Dm49c/dYNzRgFYwq+vNHq5F54pGMd13D13rmvg8csy7kuNo/k4YfyghTcdUTdx45djczcPqxlH8cOiIc74tXJHYx6GH0fxw6Jh/fFr9dd45mHYcRQ/LBrWG78sfyM3D8ONo/iRatH0x0MpZf5v0rbpiJ4Ixh5H8QOWexPh09DejAUZRw+5A5CO+AEgfgAgfgAgfgAgfgAgfgAQmef8GjM+7zK17W7fxOtxXY2jcTSO4se/J+P40GiQh5OjvR7XNfk4Pp5+/OP1wWBUNo7i1/rm5vW4rvzh6/cyyTgOj2UwjnWOo7/5AZCO+AEgfgAgfgAgfgAgfgAgfgAgfgAgfgCwHie8AHCV4e1U7Qk34gfARc5ncbrzAyCNBg7y9jc/ANIRPwDEDwDEDwDEDwDEDwDEDwAi85wfAFXqjwfxAyBn9Lbfhk78ABA98QNA9MQPgKTREz8A0kVP/ACYJE5zmSN64gdASHNGT/wACB+puTjhBYB0xA8A8QMA8QMA8QMA8QMA8QMA8QMA8QOA9TjhBUhneDsNRkH8Qoh2TE7/1A0RXxdwwz7zeDIIBLvze7n3TgyY1+uDMaCU4m9+AIgfAIgfAIgfAIgfAIgfAIgfAITihBdgMf3xUEopZbvbGwfED8hhPDHpfIJSsgi+j54TpMQPEEHRQ/wAERQ9xA8QQdFD/AARFD1ujJ9PH80z+f1cbbwe13XdCNYacfMxcPxqnVzhNpFGxzHaz7X063FdRTBU9OzXk+mGwVgCkIsTXgAQPwAQPwAQPwAQPwAQPwAQPwAQPwAQPwAQPwAQP0isf+oG5zrmHcdor7uF+Xj9Vxq93Nf1g989L/PVIrWNS9RxNO7GxTj6uULFr9bBGl931M3bOFq8QMD4tbLJiGAb4yh6wKzxa/12XwTrGkfRA2aNX5ZNRgTrGEfRA2aNX9ZNRgRjjqPoAbPGzybz2zj0x0MppZTtt0EM1xhH8xGYkef8ABA/ABA/ABA/ABA/ABA/ABA/AAhkE+WFjM+DTW2726e6oMYx9jjW+nOsff1buR6I3+y2j6cf/3h9cJWNYzpTfdfa+XAChw4gfvP6+r1McqLK8FhSL1bjOFH8Kz3hp9WTiZy4xFT8zQ8A8QMA8QMA8QMA8QMA8QMA8QMA8QMA8QOAxWwMQZuGt5PjqADEL4fzWZzcNo6O0QLxoyIOoJ7G3Ac53z2LK6zI3/xgrbj6pgQQPxBBQPxABAHxAxEExA9EELiKT3tC9AiWUvrjoZTiEQxw5wcA7vyIZLxTufW/3+72BhMQP+qK3rW/phv/u/6pG0QQED+ajp4IAuJH2uiJICB+pI2eCALiR9roiSAgfqSN3r8iGJ1Ig/hRoagPWUeP4HncnNoC4ofoZX2dwLqc8AKAO7/aDW8nv1aaw/jrOt9ADohf4Oi9Pri6IgjQZvxETwQB0sRP9EQQIE38RE8EAdLET/REECBN/ESv7gj6BnJA/EQPAPETPQASx+984K/YAfy+P/qzQft3flBKcQA0WA+zcrYnAOIHAOIHAOIHAHXzgZfGvH+ofPxm8/OnaQEQv9aJIID4iaAIAvyK3/nXZZVvin+cJen5GBFsYD4TZF9Jvl5amo+bVjZFm4QItrzJOOHDejEfZ4pfrRfZJmFR22SwXszHm+NXy0W2SVjUNhmsF/Nx8vhFvcg2CYvaJoP1Yj7OHr8oF9kmYVGLHtaL+bh4/D66yGtNsmsv6tKTqLVFbRzXnc9RNkdi7o9Z5uMq8VvrIl8cvaU360one7hNNsk4VhM98zpFBDP+5qEbBnMbgFwcbA2A+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AFA8/Hrn7oh0jl40V6PcXRdjaNxZLpx/HWw9ct9mxdg6Z/LOLqurqtxNI7u/ABA/ABA/ABA/ABA/ABA/ABA/ABA/ABA/ABA/AAQPwAQPwAQPwBow8YQANSlPx6a/Lm2u734AfAueo1+99/229CVUhb9qibxA6gtEtzM3/wAED8AED8AED8AED8AED8AED8AED8AED8AWIwTXoA0nJCC+IFNO58Fz45E/ACbNuaP+AEgeuIHgOiJHwCiJ34AiJ74wZL64+HD/22726f7mRE98YOWo/fU2VwQPfGDXD71fF2jG5FnCxE/gL/cEQskq87DG341L37wGRl/zeRXa1QSvWvehIkfAGmiJ34ApIue+AGQLnriB0C66IkfrLCIp9Lqg/Xkntd/zPMZP00sflCR82bgk5hkmOczEj9oZDHXdMeQ/c61laPjap7X4gcsvlmeH5JPFsEl/paF+AEiKHoki5+/iYAIih5p4id6IIKiR5r4iR6IoOiRJn6iByIoeqSJn+iBCIoeaeInepA2glH2AdETP9EDRBnxEz0AxO+z76DG3+WLXVPvRL0zBvvM3M5/E77gdZ3j58y938ehWtHePHgzA+1pYF1v3pfcmXvuWABat/nodtaZewCkiV+WCIoegPiVLBEUPQA+/WlPZ+4BkC5+tUZQ9AC4OX61RFD0AJg8flEjuHb0PC9Zx28AAPGbxNoRjHKnl/15yejR8xsAYNL4rbX5R93cRFD0gETxW2rzr2VzE0HRAxLFb67Nv9bNTQRFD0gUv6k2/1Y2NxEUPSBR/D7a/K/972t36ziw7LyI9mnR7J9e9fP79HJ18bt282/1Hb0IBo9esOuSfZ74+e0TU+mGwVgCkMsXQwCA+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AGA+AHATDaGoC3nb4vw7QZgLfLhdbk+fi/3dR0KevcccwJGGcfarmfU628czWHj0uidX60DOb7uKIvXhMx9/Y2jtUQl8Wtlgq29eC1Um7dxtJaoIH6tTrClF6+FavM2jtYSFcQvywSbe/FaqDZv42gtUUH8sk6wqRevhWrzNo6iRwXxM8F+G4f+eCilXPExZeOY+/oz3ThaS8zIQ+4AiB8AiB8AiB8AiB8AiB8AiB8ABBLmK43G54Gmtt3tXeUVx39tS19/49jeXLaHtLkmmv0+v+3j6cc/Xh/Mvv+amD+/26q56z8+VL3Qg9LG0R6CO7+bfP1eJjlRY3gsToe4ZHPDODbm1r3EHtL2GvE3PwDSET8AxA8AxA8AxA8AxA8AxA8AxA8AxA8A1rMxBECLhreTE1oQPyCH85mca7+OiY/zGs+Pre0ovaivV/y4TsKDjo1LJaIcRG0uLDMOd89XxVX8sKCB+vekCyMofogekC6C4ofoAekiKH6IHpAuguKH6HGT/ngwCFQXQfFD9IA0e9z4Zk38gJvU9twZiB+841d4E49npQ9mI36QMno26wv4lTniB6IHiB+IHiB+IHqA+IHoAeKHOM1n7ui1+mnR7W5f3ZxY4zVHnAvmpPiR2OzR+/mR/mbHbcFPdN46lmu85pBvKM1J8UOkvG5jme3nMSf/2xdDAID4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AcBSwp3wMrydfDEmADnit308uRqJRTuKaTwX0RFRIH7zen1wNTJr5RDi5IcpY07Wwt/8ABA/ABA/ABA/ABA/ABA/ABA/AAjk/JxffzyUUkrZ7vapB2QcB8A6ot05eY7feJLF+WSLZBF8PzBO9gDriHbn5B8nvGSLoMUK1hH55uSHx5u1HkGLFawj8s7Jf57t2VoELVawjjAnP32wde0RtFjBOsKcvDh+H0WwNnMv1lo/5ebTecYx0jpyLYzD3HNyc+v/US0RnD16lb4ZqPV1G0fRM6eNwy1zshsG8wSAXJzwAoD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4AYD4Lax/6gZnBBpHoE1XH2xdXu5taMbFuF/r7rkzjg2PIw3Gz+aOzXq61x1l8zaOiJ/oIXppNm/jiPiJHqKXZvM2joif6CF6aTZv4wgfxE/0EL32Nm/jKIJ8ED/RQ/TCjkN/PJRSStl+GzrjuMI40hzP+QEgfgAgfgAgfgAgfgBcwdm369kYAoB/8KlZd34A4M5vqtv/n8/f1K6Vn+O97W6famHMdR2No3FE/Npa5H5vz39t1o+nH/94fTAYxhHx+8vkrvTkheZPjEj6N4+v38sk13V4LKnfHBlHovE3PwDc+YE7PkD8ED0A8UP0AMQP0QMQP0QPQPwQPQDxQ/QAxA/RAxA/RC+C4e1k/Iwj4jef5o8HE72qnM+QxDgS3ni28iUdiXPnN/dmffecI66iNw0HJxtHmt53NukuTqsRFD0A8UsTQdEDEL80ERQ9APFLE0HRAxC/NBFMFr3+ePjwf9vu9ul+ZkD8FonMuBGt/ghGtuj9/MgyeGOC+GW+E022WXzqzUajbwg86+rNGOJHI9GzoU+7CV86nuffYDT6q2JvSBA/2opexg/2zPAzj9fhHE8RBPHDnV62OxgRBPFD9ERQBBE/ED0RBPED0RNBEL8lN9fJFrfFLHrm48URDB9t6zrFenHnd83iGL9HzFeqiJ752EwEz/PQMX8x9omKn4MMF7+v38skm+zwWCyOKTebpLLOR292aH2efHH5AMhG/AAQPwCW0T91Q6S/m0V7PXPyqAPAv0T7gI0P/LjzAwDxAwDxAwDxA0D8ACCXcJ/2HN5OPsWE+QjkiN/57EMwH4E0d34OoCaSVuaj58Hgr/zNDwDxAwDxAwDxAwDxAwDxAwDxA4BAzs/59cdDKaWU7W6fekDGcSDGdTAfzUfjyKzx234bulJ+fJNvxk3n/eIYx4N1mI/mo3Fkkfhl3XQsDhE0H40j4pdm07E4RNB8FD3EL82mY3GIoPkoevDpg61r33QsDhE0H0UPLo7fR5tOrZtmbYsa89E8Mo72hxXjV+umU030Kt3ERTDYZp1kHmUbR/vDdP4HCc7safHYZuMAAAAASUVORK5CYII=",
		frames: {
			"A": {x: 0, y: 0, width: 76, height: 73},
			"B": {x: 84, y: 0, width: 76, height: 73},
			"C": {x: 166, y: 0, width: 76, height: 73},
			"D": {x: 248, y: 0, width: 76, height: 73},
			"E": {x: 328, y: 0, width: 76, height: 73},
			"F": {x: 0, y: 84, width: 76, height: 73},
			"G": {x: 84, y: 84, width: 76, height: 73},
			"H": {x: 164, y: 84, width: 76, height: 73},
			"I": {x: 246, y: 84, width: 46, height: 73},
			"J": {x: 294, y: 84, width: 76, height: 73},
			"K": {x: 374, y: 84, width: 76, height: 73},
			"L": {x: 0, y: 168, width: 76, height: 73},
			"M": {x: 82, y: 168, width: 118, height: 73},
			"N": {x: 200, y: 168, width: 76, height: 73},
			"O": {x: 284, y: 168, width: 76, height: 73},
			"P": {x: 364, y: 168, width: 76, height: 73},
			" ": {x: 436, y: 168, width: 24, height: 73},
			"Q": {x: 0, y: 252, width: 76, height: 73},
			"R": {x: 82, y: 252, width: 76, height: 73},
			"S": {x: 164, y: 252, width: 76, height: 73},
			"T": {x: 246, y: 252, width: 76, height: 73},
			"U": {x: 330, y: 252, width: 76, height: 73},
			"V": {x: 0, y: 336, width: 76, height: 73},
			"W": {x: 84, y: 336, width: 113, height: 73},
			"X": {x: 200, y: 336, width: 81, height: 73},
			"Y": {x: 284, y: 336, width: 80, height: 73},
			"Z": {x: 364, y: 336, width: 81, height: 73},
			"0": {x: 0, y: 421, width: 81, height: 73},
			"1": {x: 81, y: 421, width: 81, height: 73},
			"2": {x: 128, y: 421, width: 82, height: 73},
			"3": {x: 210, y: 421, width: 83, height: 73},
			"4": {x: 293, y: 421, width: 82, height: 73},
			"5": {x: 374, y: 421, width: 82, height: 73},
			"6": {x: 0, y: 505, width: 82, height: 73},
			"7": {x: 82, y: 505, width: 82, height: 73},
			"8": {x: 164, y: 505, width: 82, height: 73},
			"9": {x: 246, y: 505, width: 82, height: 73},
			":": {x: 327, y: 505, width: 37, height: 73},
			".": {x: 364, y: 505, width: 36, height: 73},
			"-": {x: 400, y: 505, width: 47, height: 73}
		}
	}
	
    BitmapText.name = "BitmapText";

	M.extend( BitmapText, Renderizable );

	namespace.BitmapText = BitmapText;

})(Match.renderizables, Match, Match.renderizables.Renderizable, Match.sprites.assets);/**
 * @module Match
 */
(function(M) {

	/**
	 * Executes a callback once per interval
	 *
	 * @class Timer
	 * @constructor
	 * @extends GameObject
	 * @param {int} interval time in milliseconds before calling the callback
	 * @param {Function} callback function to be called
	 * @param {Object} [owner] object to apply the callback to
	 */
	function Timer( interval, callback, owner ) {
		/**
		 * Interval time in milliseconds before calling the callback
		 * @property interval
		 * @type int
		 */
		/**
		 * Time in milliseconds when the last tick took place
		 * @private
		 * @property _lastTime
		 * @type int
		 */
		/**
		 * Object to apply the callback to
		 * @optional
		 * @property owner
		 * @type Object
		 */
		/**
		 * Function that will be called
		 * @property callback
		 * @type Function
		 */
		
		this.interval = interval;
		this._lastTime = M.getTime();
		if ( owner ) {
			this.owner = owner;
			this.callback = callback;
		} else {
			this.tick = callback;
		}
		this.enabled = true;
	}
	
	
	/**
	 * Checks if the interval has been reached and calls the callback
	 * @method onLoop
	 */
	Timer.prototype.onLoop = function(p) {

		if ( this.enabled && M.elapsedTimeFrom( this._lastTime, this.interval ) ) {

			this.tick();
			this._lastTime = M.getTime();

		}

	};
	/**
	 * Calls the callback
	 * @method tick
	 */
	Timer.prototype.tick = function() {
		this.callback.call(this.owner);
	};
	
	M.Timer = Timer;

})(window.Match);/**
 * @module Match
 */
(function(M) {
    
    /**
	 * Used for knowing if the given amount of milliseconds have passed since last check.
     * This class is usefull for objects like weapons and determining if it can fire again
     * or not given its rate-of-fire
	 * @class TimeCounter
	 * @constructor
	 * @param {time} integer Time in milliseconds that need to pass from last check
	 */
	function TimeCounter(time) {
		/**
		 * Last time in milliseconds that update was called
		 * @property _lastTime
		 * @private
		 * @type int
		 */
		this._lastTime = 0;
		/**
		 * Time in milliseconds that need to pass from last check
		 * @property _lastTime
		 * @type int
		 */
		this.time = time;

	}
	TimeCounter.prototype.initialize = function() {
		this._lastTime = M.getTime();
		this.elapsed = this._run;
		return false;
	};
	/**
	 * Sets the time interval
	 * @method elapsed
	 * @param {integer} value the inteval
	 */
	TimeCounter.prototype.setInterval = function(value) {
		this.elapsed = this.initialize;
		this.time = value;
		return false;
	};
	/**
	 * Returns true if time has elapsed since last update or false
	 * @method elapsed
	 * @private
	 */
	TimeCounter.prototype._run = function() {

		var currentTime = M.getTime();

		if ( currentTime - this.time >= this._lastTime ) {
			this._lastTime = currentTime;
			return true;
		}

		return false;

	};
	/**
	 * Resets the counter
	 * @method reset
	 */
	TimeCounter.prototype.reset = function() {
		this.elapsed = this.initialize;
	};

	TimeCounter.prototype.elapsed = TimeCounter.prototype.initialize;

	M.TimeCounter = TimeCounter;

	})(window.Match);(function (namespace, SimpleMap, M) {

	function StoreAs(name, attributes) {
		this.name = name;
		this.attributes = attributes;
	}
	StoreAs.prototype.as = function(actualName) {
		var value = M.game.attributes[actualName];
		if ( typeof value == "function" ) {
			value = new value;
		}
		this.attributes.set(this.name, value);
		return value;
	}
	
	function ShowsAs(name, views) {
		this.name = name;
		this.views = views;
	}
	ShowsAs.prototype.as = function(renderizableName) {
		var value = M.renderizables[renderizableName.charAt(0).toUpperCase() + renderizableName.substr(1)];
		if ( typeof value == "function" ) {
			value = new value;
		}
		this.views.set(this.name, value);
		return value;
	};

	function Entity(name) {
		this.extendsEventHandler();
		this.name = name || ("Unnamed Entity" + M._gameObjects.length);
		this.attributes = new SimpleMap();
		this.behaviours = new SimpleMap();
		this.views = new SimpleMap();
	}

	Entity.prototype.onLoop = function(p) {
		var i = 0, a = this.attributes, views = this.views, v = this.behaviours._values, l = v.length;
		for ( ; i < l; i++ ) {
			v[i](this, a, views, p);
		}
	};
	
	Entity.prototype.getAttribute = function(name) {
		return this.attributes.get(name);
	};

	Entity.prototype.attribute = function(name, value) {
		if ( arguments.length == 2 ) {
			this.attributes.set(name, value);
		} else {
			return this.attributes.get(name);
		}
	};

	Entity.prototype.behaviour = function(name, value) {
		if ( arguments.length == 2 ) {
			this.behaviours.set(name, value);
		} else {
			return this.behaviours.get(name);
		}
	};
	
	Entity.prototype.getBehaviour = function(name) {
		return this.behaviours.get(name);
	};

	Entity.prototype.behaviour = Entity.prototype.getBehaviour;
	
	Entity.prototype.getView = function(name) {
		return this.views.get(name);
	};

	Entity.prototype.view = Entity.prototype.getView;
	
	Entity.prototype.has = function(name, value) {
		if ( value == undefined ) {
			value = M.game.attributes[name];
			if ( typeof value == "function" ) {
				value = new value;
			}
			if ( value == undefined ) {
				return new StoreAs(name, this.attributes);
			}
		}
		this.attributes.set(name, value);
		return value;
	};
	Entity.prototype.hasnt = function(name) {
		return this.attributes.remove(name);
	};
	
	Entity.prototype.does = function(name, value) {
		if ( value == undefined ) {
			value = M.game.behaviours[name];
		}
		if ( value == undefined ) {
			M.logger.error("Cannot add undefined behaviour " + name + " to entity");
		} else {
			this.behaviours.set(name, value);
		}
		return this;
	};
	
	Entity.prototype.do = function(name) {
		var behaviour = this.behaviour.get(name);
		if ( behaviour ) {
			behaviour(this, this.attributes, this.views, M.onLoopProperties)
		}
	};
	
	Entity.prototype.doesnt = function(name) {
		return this.behaviours.remove(name);
	};

	Entity.prototype.shows = function(name, value) {
		if ( value == undefined ) {
			return new ShowsAs(name, this.views);
		} else {
			this.views.set(name, value);
		}
	};
	
	Entity.prototype.doesntShow = function(name) {
		return this.views.remove(name);
	};

	Entity.name = "Entity";

	M.extend(Entity, EventHandler);

	namespace.Entity = Entity;

})(M, SimpleMap, M);(function (M) {
	
	function Trigger() {
		this.disabled = false;
	}

	Trigger.prototype.enable = function() {
		this.disabled = false;
	};

	Trigger.prototype.disable = function() {
		this.disabled = true;
	};

	Trigger.prototype.onLoop = function() {
		if ( this.disabled ) return;
		this.update();
	};

	Trigger.name = "Trigger";

	M.Trigger = Trigger;

})(Match);(function (M, SimpleCollisionHandler) {
	
	function CollisionTrigger() {
		
		this.extendsTrigger();

		this.entitiesAndCallbacks = [];

	}

	CollisionTrigger.prototype.update = function() {

		var i = 0,
			l = this.entitiesAndCallbacks.length,
			wrapper,
			manifold;

		for ( i = 0; i < l; i++) {

			wrapper = this.entitiesAndCallbacks[i];

			manifold = wrapper.entity.attribute("manifold");

			if ( manifold ) {

				wrapper.callback(manifold, this);

			}

		}

	};

	CollisionTrigger.prototype.onCollision = function (entity, callback) {
		this.entitiesAndCallbacks.push({
			entity: entity,
			callback: callback
		});
	};

	M.extend(CollisionTrigger, M.Trigger);

	M.CollisionTrigger = CollisionTrigger;

})(Match);(function (M, SimpleCollisionHandler) {
	
	function AreaTrigger(left, top, width, height) {
		
		this.extendsTrigger();

		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;

		this.entitiesAndCallbacks = [];

	}

	AreaTrigger.prototype.getLeft = function() {
		return this.left;
	};
	AreaTrigger.prototype.getTop = function() {
		return this.top;
	};
	AreaTrigger.prototype.getRight = function() {
		return this.left + this.width;
	};
	AreaTrigger.prototype.getBottom = function() {
		return this.top + this.height;
	};

	AreaTrigger.prototype.update = function() {

		var i = 0,
			l = this.entitiesAndCallbacks.length,
			self = this,
			wrapper;

		for ( i = 0; i < l; i++) {

			wrapper = this.entitiesAndCallbacks[i];

			wrapper.entity.views.eachValue(function (view) {

				if ( SimpleCollisionHandler.haveCollided(view, self) ) {
					wrapper.callback(wrapper.entity, self);
					return;
				}

			});

		}

	};

	AreaTrigger.prototype.onObjectInArea = function(entity, callback) {
		this.entitiesAndCallbacks.push({
			entity: entity,
			callback: callback
		});
	};

	M.extend(AreaTrigger, M.Trigger);

	M.AreaTrigger = AreaTrigger;

})(Match, Match.collisions.Simple);M.registerScene("matchLogo", {

	sprites: {
		fonts: M.renderizables.BitmapText.DEFAULT_FONT,
	},

	onLoad: function() {

		var object = new M.Entity(),
			center = M.getCenter();

		object.shows("poweredBy").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y - 40, text: "POWERED BY",
			scaleX: 0.15,
			scaleY: 0.15
		});
		object.shows("match").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y, text: "MATCH",
			scaleX: 0.5,
			scaleY: 0.5
		});

		M.push(object).to("logo");
		
		M.getLayer("logo").background = "#000";
		
	}

});M.registerScene("loading", {

	sprites: {
		fonts: M.renderizables.BitmapText.DEFAULT_FONT
	},
	
	onLoad: function() {

		var loading = new M.Entity(),
			progressBar = new M.Entity(),
			center = M.getCenter(),
			background,
			backgroundWidth;
		
		loading.shows("loading").as("bitmapText").set({
			fill: "fonts", x: center.x, y: center.y, text: "LOADING...",
			scaleX: 0.25,
			scaleY: 0.25
		});
		
		progressBar.shows("background").as("rectangle").set({
			fill: "#fa0",
			x: loading.getView("loading").getX(),
			y: center.y + 30,
			width: 0,
			height: 20
		});
		progressBar.shows("border").as("rectangle").set({
			fill: "rgba(0,0,0,0)",
			x: center.x,
			y: center.y + 30,
			width: 150,
			height: 20,
			border: "#a50",
			borderWidth: 2
		});

		M.push(loading).to("loading");
		M.push(progressBar).to("loading");
		
		M.getLayer("loading").background = "#000";
		
		background = progressBar.getView("background"),
		backgroundWidth = progressBar.getView("border").getWidth();
		
		M.sprites.onImageLoaded.addEventListener(function (data) {
		
			background.setWidth(backgroundWidth - data.remaining * backgroundWidth / data.total);
			background.setLeft(loading.getView("loading").getLeft());
			
			console.debug("loaded sprite: " + data.name);
		
		});
		
	}
		
});M.registerAttribute("location", M.math2d.Vector2d);M.registerAttribute("direction", M.math2d.Vector2d);M.registerAttribute("areaToStayIn", function (top, right, bottom, left) {
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;
});M.registerAttribute("collisionGroup", 0);M.registerBehaviour("accelerate", function(e, a) {
	if ( a.get("isAccelerating") ) {
	
		var speed = a.get("speed") + a.get("acceleration"),
			maxSpeed = a.get("maxSpeed");
		
		if ( speed > maxSpeed ) {
			speed = maxSpeed;
		}
	
		a.set("speed", speed);
		
	}
});M.registerBehaviour("bounce", function(e, a, v, p) {
	
	var direction = a.get("direction"),
		viewportWidth = p.m.renderer.getWidth(),
		viewportHeight = p.m.renderer.getHeight();

	v.eachValue(function (view) {

		view.offset(direction.x, direction.y);
	
		if ( view.getRight() > viewportWidth || view.getLeft() < 0 ) {
			direction.x *= -1;
		}
	
		if ( view.getBottom() > viewportHeight || view.getTop() < 0 ) {
			direction.y *= -1;
		}

	});
		
});(function (M) {

	function Manifold(entity, otherEntity, viewFromSelf, viewFromOther, collisionInX, collisionInY) {
		this.entity = entity;
		this.collidedWith = otherEntity;
		this.viewFromSelf = viewFromSelf;
		this.viewFromOther = viewFromOther;
		this.collisionInX = collisionInX;
		this.collisionInY = collisionInY;
	}


	M.registerBehaviour("collide", function(entity, attributes) {

		var location = attributes.get("location"),
			otherObjects = M._gameObjects,
			i = 0,
			l = otherObjects.length,
			otherEntity,
			collisionGroup = attributes.get("collisionGroup"),
			// simpleCollisionHandler = M.collisions.Simple,
			polygonCollisionHandler = M.collisions.Polygon,
			collisionInX = false,
			collisionInY = false,
			viewFromSelf,
			viewFromOther,
			j,
			k,
			currentY,
			prevY;
		
		for ( ; i < l; i++ ) {
		
			otherEntity = otherObjects[i];
			
			if ( otherEntity != entity && otherEntity.attribute("collisionGroup") == collisionGroup ) {

				for ( k = 0; k < otherEntity.views._values.length; k++ ) {

					viewFromOther = otherEntity.views._values[k];

					for ( j = 0; j < entity.views._values.length; j++ ) {
						
						viewFromSelf = entity.views._values[j];

						if ( polygonCollisionHandler.haveCollided(viewFromSelf, viewFromOther) ) {

							currentY = viewFromSelf._y;
							prevY = viewFromSelf._prevY;

							viewFromSelf._y = prevY;


							if ( polygonCollisionHandler.haveCollided(viewFromSelf, viewFromOther) ) {
								collisionInX = true;
							} else {
								collisionInY = true;
							}

							viewFromSelf._y = currentY;

							var manifold = new Manifold(entity, otherEntity, viewFromSelf, viewFromOther, collisionInX, collisionInY);

							attributes.set("manifold", manifold);

							entity.raiseEvent("onCollision", manifold);

							if ( attributes.get("preventMoveOnCollision") ) {
								location.set(location.prevX, location.prevY);
							}
							
							return;
						
						}
						
					}
					
				}
			
				
			}
		}
		
		attributes.set("manifold", false);
		
	});

})(Match);
M.registerBehaviour("deccelerate", function(e, a) {
	if ( a.get("isDecelerating") ) {
	
		var speed = a.get("speed") - a.get("deceleration"),
			minSpeed = a.get("minSpeed");
		
		if ( !a.get("canGoReverse") && speed < 0 ) {
			speed = 0;
		}
		
		if ( speed < minSpeed ) {
			speed = minSpeed;
		}
		
		a.set("speed", speed);
	
	}
});M.registerBehaviour("fixViewsToEntity", function(e, a, v) {

	var rotation = a.get("rotation"),
		location = a.get("location"),
		offsetRotation = 0,
		offsetX = 0,
		offsetY = 0;

	if ( this.rotation == undefined ) {
		this.rotation = 0;
	}

	if ( this.location == undefined ) {
		this.location = new Object();
		this.location.x = 0;
		this.location.y = 0;
	}

	if ( rotation && rotation != this.rotation ) {
		offsetRotation = rotation - this.rotation;
		this.rotation = rotation;
	}

	if ( location.x != this.location.x ) {
		offsetX = location.x - this.location.x;
		this.location.x = location.x;
	}
	if ( location.y != this.location.y ) {
		offsetY = location.y - this.location.y;
		this.location.y = location.y;
	}
	
	v.eachValue(function(view) {

		if ( offsetX != 0 || offsetY != 0 ) {

			view.offset(offsetX, offsetY);

		}

		if ( offsetRotation != 0 ) {

			view.offsetRotation(offsetRotation, location.x, location.y);

		}

	});

});M.registerBehaviour("followCamera", function(e, a, v, p) {

	var location = a.get("location");

	p.m.renderer.camera.centerAt(location.x, location.y);

});(function (M) {

	M.registerBehaviour("monitorAttributes", function(entity, attributes) {
	
		var location = attributes.get("location"),
			rotation = attributes.get("rotation");
		
		if ( !this._cachedValues || this._cachedValues.x != location.x || this._cachedValues.y != location.y || this._cachedValues.rotation != rotation ) {

			this._cachedValues = {
				x: attributes.get("location").x,
				y: attributes.get("location").y,
				rotation: attributes.get("rotation")
			};

			attributes.push("attributeChanged", true);

			this.alreadyUpdated = false;
			
		} else if ( !this.alreadyUpdated ) {
			
			attributes.push("attributeChanged", false);
			
			this.alreadyUpdated = true;
			
		}
		
	});

})(M);M.registerBehaviour("rotateViews", function(e, a, v) {

	var rotation = a.get("rotation"),
		offsetRotation = 0;

	if ( this.rotation == undefined ) {
		this.rotation = 0;
	}

	if ( rotation != this.rotation ) {
		offsetRotation = rotation - this.rotation;
		this.rotation = rotation;
	}

	if ( offsetRotation != 0 ) {

		//Rotar todos los vertices de las vistas usando el centro "location" como pivote y su propia rotacion
		var location = a.get("location");
		
		v.eachValue(function(view) {

			view.offsetRotation(offsetRotation);

		var x = view._x - location.x,
			y = view._y - location.y,
			rotatedX = M.math2d.getRotatedVertexCoordsX(x, y, offsetRotation),
			rotatedY = M.math2d.getRotatedVertexCoordsY(x, y, offsetRotation);

			view.setLocation(rotatedX + location.x, rotatedY + location.y);

		});

	}

});M.registerBehaviour("stayInArea", function(e, a, v, p) {
	
	var area = a.get("areaToStayIn");
	
	v.eachValue(function(view) {
		if ( view.getLeft() < area.left ) {
			view.setLeft(area.left);
		}		
		if ( view.getRight() > area.right ) {
			view.setRight(area.right);
		}
		if ( view.getTop() < area.top ) {
			view.setTop(area.top);
		}		
		if ( view.getBottom() > area.bottom ) {
			view.setBottom(area.bottom);
		}
	});
	
});M.registerBehaviour("stickToCanvas", function(e, a, v, p) {
	
	var viewportWidth = p.m.renderer.getWidth(),
		viewportHeight = p.m.renderer.getHeight();
	
	v.eachValue(function(view) {
		if ( view.getLeft() < 0 ) {
			view.setLeft(0);
		}		
		if ( view.getRight() > viewportWidth ) {
			view.setRight(viewportWidth);
		}
		if ( view.getTop() < 0 ) {
			view.setTop(0);
		}		
		if ( view.getBottom() > viewportHeight ) {
			view.setBottom(viewportHeight);
		}
	});
	
});M.registerBehaviour("translateViews", function(e, a, v) {

		var location = a.get("location"),
			offsetX = 0,
			offsetY = 0;

		if ( this.location == undefined ) {
			this.location = new Object();
			this.location.x = 0;
			this.location.y = 0;
		}

		if ( location.x != this.location.x ) {
			offsetX = location.x - this.location.x;
			this.location.x = location.x;
		}
		if ( location.y != this.location.y ) {
			offsetY = location.y - this.location.y;
			this.location.y = location.y;
		}

		if ( offsetX != 0 || offsetY != 0 ) {

			v.eachValue(function(view) {

				view.offset(offsetX, offsetY);

			});

		}

});