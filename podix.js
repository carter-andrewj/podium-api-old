"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _radixdlt = require("radixdlt");

var _formData = _interopRequireDefault(require("form-data"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _getAccount(seed) {
  var hash = _radixdlt.RadixUtil.hash(Buffer.from(seed));

  return new _radixdlt.RadixAccount(_radixdlt.RadixKeyPair.fromPrivate(hash));
}

var PodiumError =
/*#__PURE__*/
function (_Error) {
  _inherits(PodiumError, _Error);

  function PodiumError() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, PodiumError);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(PodiumError)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.podiumError = true;
    Error.captureStackTrace(_assertThisInitialized(_assertThisInitialized(_this)), PodiumError);
    return _this;
  }

  _createClass(PodiumError, [{
    key: "withCode",
    value: function withCode(code) {
      this.code = code;
      this.message = this.report(code);
      return this;
    }
  }, {
    key: "report",
    value: function report() {
      switch (this.code) {
        case 0:
          return "Server Offline.";

        case 1:
          return "No data received.";

        case 2:
          return "Timed out.";

        default:
          return "Unknown error.";
      }
    }
  }]);

  return PodiumError;
}(_wrapNativeSuper(Error));

var Routes =
/*#__PURE__*/
function () {
  function Routes() {
    _classCallCheck(this, Routes);
  }

  _createClass(Routes, [{
    key: "faucet",
    value: function faucet() {
      return _radixdlt.RadixAccount.fromAddress('9he94tVfQGAVr4xoUpG3uJfB2exURExzFV6E7dq4bxUWRbM5Edd', true);
    } // Users

  }, {
    key: "forProfileOf",
    value: function forProfileOf(address) {
      return _radixdlt.RadixAccount.fromAddress(address);
    }
  }, {
    key: "forKeystoreOf",
    value: function forKeystoreOf(id, pw) {
      return _getAccount("podium-keystore-for-" + id.toLowerCase() + pw);
    }
  }, {
    key: "forProfileWithID",
    value: function forProfileWithID(id) {
      return _getAccount("podium-ownership-of-id-" + id.toLowerCase());
    }
  }, {
    key: "forIntegrityOf",
    value: function forIntegrityOf(address) {
      return _getAccount("podium-integrity-score-of-" + address);
    } // Tokens

  }, {
    key: "forPODof",
    value: function forPODof(address) {
      return _getAccount("podium-token-transactions-of-" + address);
    }
  }, {
    key: "forAUDof",
    value: function forAUDof(address) {
      return _getAccount("audium-token-transactions-of-" + address);
    } // Topics

  }, {
    key: "forTopic",
    value: function forTopic(address) {
      return _radixdlt.RadixAccount.fromAddress(address);
    }
  }, {
    key: "forTopicWithID",
    value: function forTopicWithID(id) {
      return _getAccount("podium-topic-with-id-" + id.toLowerCase());
    }
  }, {
    key: "forPostsAboutTopic",
    value: function forPostsAboutTopic(address) {
      return _getAccount("podium-posts-about-topic-" + address);
    } // Posts

  }, {
    key: "forPostsBy",
    value: function forPostsBy(address) {
      return _getAccount("podium-posts-by-user-" + address);
    }
  }, {
    key: "forPost",
    value: function forPost(address) {
      return _radixdlt.RadixAccount.fromAddress(address);
    }
  }, {
    key: "forNextPostBy",
    value: function forNextPostBy(user) {
      // TODO - Fix this so posts are stored deterministicly again
      return _getAccount("podium-post-by-" + user.get("address") + "-" + (user.get("posts") + user.get("pending")));
    }
  }, {
    key: "forNewPost",
    value: function forNewPost(post) {
      return _getAccount("podium-post-with-content-" + post);
    }
  }, {
    key: "forRepliesToPost",
    value: function forRepliesToPost(address) {
      return _getAccount("podium-replies-to-post-" + address);
    }
  }, {
    key: "forPromotionsOfPost",
    value: function forPromotionsOfPost(address) {
      return _getAccount("podium-promotions-of-post-" + address);
    } // Media

  }, {
    key: "forMedia",
    value: function forMedia(file) {
      return _getAccount(JSON.stringify(file));
    }
  }, {
    key: "forMediaFrom",
    value: function forMediaFrom(address) {
      return _getAccount("podium-media-uploaded-by-" + address);
    } // Follows

  }, {
    key: "forUsersFollowing",
    value: function forUsersFollowing(address) {
      return _getAccount("podium-user-followers-" + address);
    }
  }, {
    key: "forUsersFollowedBy",
    value: function forUsersFollowedBy(address) {
      return _getAccount("podium-user-following-" + address);
    }
  }, {
    key: "forRelationOf",
    value: function forRelationOf(address1, address2) {
      return _getAccount("podium-user-" + address1 + "-follows-user-" + address2);
    } // Alerts

  }, {
    key: "forAlertsTo",
    value: function forAlertsTo(address) {
      return _getAccount("podium-user-alerts-" + address);
    }
  }]);

  return Routes;
}();

var Podix =
/*#__PURE__*/
function () {
  // INITIALIZATION
  function Podix() {
    var _this2 = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Podix);

    // Set up global variables
    this.user = null;
    this.route = new Routes();
    this.channels = (0, _immutable.Map)({});
    this.timers = (0, _immutable.Map)({}); // Set logging level

    this.setDebug(debug); // Load remote config if none supplied

    if (!config) {
      this.server = "https://api.podium-network.com";
      (0, _nodeFetch.default)(this.server).then(function (response) {
        if (!response.ok) {
          throw new PodiumError("Server Offline").withCode(0);
        } else {
          (0, _nodeFetch.default)(_this2.server + "/config").then(function (response) {
            return response.json();
          }).then(function (config) {
            return _this2.connect(config);
          });
        }
      });
    } else {
      this.connect(config);
    }
  }

  _createClass(Podix, [{
    key: "connect",
    value: function connect(config) {
      console.log(config); // Extract settings from config

      this.app = config.ApplicationID;
      this.timeout = config.Timeout;
      this.lifetime = config.Lifetime;
      this.server = "http://" + config.API; // "https://" + config.API

      this.media = config.MediaStore; // Connect to radix network
      //TODO - Test radix connection

      switch (config.Universe) {
        case "sunstone":
          _radixdlt.radixUniverse.bootstrap(_radixdlt.RadixUniverse.SUNSTONE);

          break;

        case "highgarden":
          _radixdlt.radixUniverse.bootstrap(_radixdlt.RadixUniverse.HIGHGARDEN);

          break;

        case "alphanet":
          _radixdlt.radixUniverse.bootstrap(_radixdlt.RadixUniverse.ALPHANET);

          break;

        default:
          throw new Error("Unknown Radix Universe.");
      }
    } // UTILITIES

  }, {
    key: "getAccount",
    value: function getAccount(seed) {
      return _getAccount(seed);
    }
  }, {
    key: "cleanUp",
    value: function cleanUp() {
      this.cleanUpTimers();
      this.cleanUpChannels();
    }
  }, {
    key: "setDebug",
    value: function setDebug(debug) {
      this.debug = debug;

      if (!debug) {
        _radixdlt.RadixLogger.setLevel('error');
      } else {
        console.log("Debug Mode On");
      }
    }
  }, {
    key: "debugOut",
    value: function debugOut() {
      if (this.debug) {
        var _console;

        (_console = console).log.apply(_console, arguments);
      }
    } // TIMERS

  }, {
    key: "newTimer",
    value: function newTimer(id, // Identifier of timer
    duration, // Duration of timer
    callback // Function to be called upon timer completion
    ) {
      var _this3 = this;

      // Start timer
      var timer = setTimeout(function () {
        // Run callback
        callback(); // Delete record of this timer

        _this3.timers.delete(id);
      }, duration); // Store timer

      this.timers.id = {
        timer: timer,
        callback: callback,
        duration: duration
      };
    }
  }, {
    key: "resetTimer",
    value: function resetTimer(id // Identifier of timer to be restarted
    ) {
      // Stop timer
      clearTimeout(this.timers.id.timer); // Recreate timer

      this.newTimer(id, this.timers.callback, this.timers.duration);
    }
  }, {
    key: "stopTimer",
    value: function stopTimer(id // Identifier of timer to be stopped
    ) {
      // Stop timer
      clearTimeout(this.timers.id.timer); // Delete record of this timer

      this.timers.delete("id");
    }
  }, {
    key: "cleanUpTimers",
    value: function cleanUpTimers() {
      var _this4 = this;

      // Stops all timers
      this.timers.map(function (t) {
        return _this4.stopTimer(t);
      });
    } // WRITE DATA TO RADIX

  }, {
    key: "sendRecord",
    value: function sendRecord(accounts, // Destination accounts for record [Array]
    payload) // Encrypt record with user's identity?
    {
      var _this5 = this;

      var identity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.user;
      var encrypt = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        if (accounts.length === 0) {
          reject(new Error("Received empty accounts array"));
        } else {
          _this5.debugOut("Writing to Ledger (x", accounts.length, "):", payload);

          _radixdlt.RadixTransactionBuilder.createPayloadAtom(accounts, _this5.app, JSON.stringify(payload), encrypt).signAndSubmit(identity).subscribe({
            complete: function complete() {
              return resolve(true);
            },
            next: function next(status) {
              return _this5.debugOut(" > ", status);
            },
            error: function error(_error) {
              return reject(_error);
            }
          });
        }
      });
    }
  }, {
    key: "sendRecords",
    value: function sendRecords() {
      var _this6 = this,
          _arguments = arguments;

      return new Promise(function (resolve, reject) {
        // Unpack arg list
        var args = Array.prototype.slice.call(_arguments); // Check if identity was provided

        var identity;

        if (args.length % 2 === 1) {
          identity = args[0];
          args = args.slice(1, args.length);
        } else if (_this6.user) {
          identity = _this6.user;
        } else {
          throw new Error("Missing Identity");
        } // Dispatch records


        _this6.sendRecord(args[0], args[1], identity).then(function (result) {
          if (args.length > 2) {
            _this6.sendRecords.apply(_this6, [identity].concat(_toConsumableArray(args.slice(2, args.length)))).then(function (result) {
              return resolve(result);
            }).catch(function (error) {
              return reject(error);
            });
          } else {
            resolve(true);
          }
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // FETCH DATA FROM RADIX

  }, {
    key: "getHistory",
    value: function getHistory(account) // Assume history is empty after X seconds inactivity
    {
      var _this7 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.timeout;
      // Pulls all current values from a radix
      // -account- and closes the channel connection.
      this.debugOut("Fetching Account History (timeout: " + timeout + ")");
      return new Promise(function (resolve, reject) {
        // Open the account connection
        account.openNodeConnection(); // Connect to account data

        var stream = account.dataSystem.getApplicationData(_this7.app); // Fetch all data from target channel

        var skipper;
        var history = (0, _immutable.List)([]);
        var channel = stream.subscribe({
          //TODO - Rewrite to pull until up-to-date once
          //		 radix provides the required flag.
          //		 Currently, this just collates all
          //		 input until timeout.
          next: function next(item) {
            // Log debug
            _this7.debugOut(" > Received: ", item.data.payload); // Cancel shortcut timer


            if (skipper) {
              clearTimeout(skipper);
            } // Unpack record


            var record = (0, _immutable.Map)((0, _immutable.fromJS)(JSON.parse(item.data.payload))).set("received", new Date().getTime()).set("created", item.data.timestamp); // Add record to history

            history = history.push(record); // Assume all records collated 1 second after first
            // (This won't work long-term, but serves as an
            // efficient fix for the timeout issue until the
            // radix lib can flag a channel as up to date).

            skipper = setTimeout(function () {
              _this7.debugOut(" > No record received for 1s. Resolving early.");

              channel.unsubscribe();
              resolve(history.sort(function (a, b) {
                return a.get("created") > b.get("created") ? 1 : -1;
              }));
            }, 1000);
          },
          error: function error(_error2) {
            channel.unsubscribe();
            reject(_error2);
          }
        }); // Set timeout

        setTimeout(function () {
          channel.unsubscribe();

          if (history.size > 0) {
            _this7.debugOut(" > Timed out. Resolving with current history.");

            resolve(history.sort(function (a, b) {
              return a.get("created") > b.get("created") ? 1 : -1;
            }));
          } else {
            _this7.debugOut(" > Timed out. No history received.");

            reject(new PodiumError().withCode(2));
          }
        }, timeout * 1000);
      }); // TODO - Close node connection
    }
  }, {
    key: "getLatest",
    value: function getLatest(account) // Assume account is empty after X seconds inactivity
    {
      var _this8 = this;

      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.timeout;
      // Returns the most recent payload among all
      // data for the provided -account-.
      // Get account history
      return new Promise(function (resolve, reject) {
        _this8.getHistory(account, timeout).then(function (history) {
          return resolve(history.sort(function (a, b) {
            return a.get("created") > b.get("created") ? 1 : -1;
          }).last());
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // SUBSCRIBE TO RADIX DATA

  }, {
    key: "openChannel",
    value: function openChannel(account, // Radix account to be queried
    callback) // Close channel after X seconds of inactivity
    {
      var _this9 = this;

      var onError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var lifetime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.lifetime;
      // Creates and manages a subscription to new data
      // updates for a given -account-, running
      // -callback- whenever a new item is received.
      // Will run -onError- callback in case of error.
      // Will timeout after -lifetime- ms of inactivity,
      // or will remain open indefinitely if -lifetime-
      // is not provided or set to 0.
      //TODO - Close channels after a period of inactivity
      //		 and reopen automatically on resume.
      // Check channel to this account is not already open
      var address = account.getAddress();

      if (address in this.channels) {
        return this.channels.get(address);
      } // Connect to the account


      account.openNodeConnection(); // Initialize data request

      var stream = account.dataSystem.applicationDataSubject; // Set up timeout, if required

      var timer;

      if (lifetime > 0) {
        timer = this.newTimer(address, lifetime, function (a) {
          _this9.closeChannel(a);
        });
      } // Subscribe to data stream


      var channel = stream.subscribe({
        next: function () {
          var _next2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(item) {
            var result;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    // Reset timeout
                    if (lifetime > 0) {
                      _this9.resetTimer(address);
                    } // Run callback


                    result = (0, _immutable.Map)((0, _immutable.fromJS)(JSON.parse(item.data.payload)));
                    callback(result);

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          function next(_x) {
            return _next2.apply(this, arguments);
          }

          return next;
        }(),
        error: function error(_error3) {
          // Run callback
          if (typeof onError === "function") {
            onError(_error3);
          } else {
            _this9.closeChannel(address);

            throw _error3;
          }
        }
      }); // Log open channel

      this.channels.set("address", (0, _immutable.Map)({
        timer: timer,
        channel: channel
      })); // Return the channel

      return channel;
    }
  }, {
    key: "closeChannel",
    value: function closeChannel(address // Radix address of channel to be closed
    ) {
      // Closes and cleans up a channel created by
      // openChannel
      // Stop channel timeout
      if (address in this.channels) {
        this.stopTimer(this.channels.get(address).timer);
        this.channels.get(address).channel.unsubscribe();
        this.channels.delete(address);
      } //TODO - Close radix node connection

    }
  }, {
    key: "cleanUpChannels",
    value: function cleanUpChannels() {
      var _this10 = this;

      // Closes all open Channels
      this.channels.map(function (c) {
        return _this10.closeChannel(c);
      });
    } // MEDIA

  }, {
    key: "uploadMedia",
    value: function uploadMedia(mediaFile, address) {
      var _this11 = this;

      // Dispatches a media file to the server, which
      // returns an ID address for that image in the
      // public store.
      return new Promise(function (resolve, reject) {
        // const body = new FormData()
        // body.append("file", mediaFile)
        // body.append("address", address)
        _this11.dispatch("media", {
          address: address,
          file: mediaFile
        }).then(function (response) {
          return resolve(response);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "registerMedia",
    value: function registerMedia(image, ext) {
      var _this12 = this;

      var identity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        //TODO - Validate media with 3rd party service
        //		 to detect image manipulation, etc...
        // Register media on ledger
        var address = identity.account.getAddress();

        var imageAccount = _this12.route.forMedia(image);

        var imageAddress = imageAccount.getAddress();
        var imageURL = "".concat(imageAddress, ".").concat(ext); // Generate file record
        //TODO - Ensure media address is independent of
        //		 the uploading user so the same image
        //		 uploaded by different users is still
        //		 only stored once on S3.

        var imagePayload = {
          record: "media",
          type: "image",
          address: imageAddress,
          ext: ext,
          uploader: address // Register media on ledger
          //TODO - Check if media already exists and skip
          //		 this step, if required

        };

        _this12.sendRecord([imageAccount], imagePayload, identity).then(function () {
          return resolve(imageURL);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "createMedia",
    value: function createMedia(image, ext) {
      var _this13 = this;

      var identity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Register media on ledger
        //TODO - Check if media already exists and skip
        //		 this step, if required
        _this13.registerMedia(image, ext, identity).then(function (address) {
          return _this13.uploadMedia(image, address);
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // SERVER

  }, {
    key: "dispatch",
    value: function dispatch(route, data) {
      var _this14 = this;

      this.debugOut("Posting to ".concat(this.server, "/").concat(route, ":"), data);
      return new Promise(function (resolve, reject) {
        var body = new _formData.default();
        Object.keys(data).forEach(function (k) {
          return body.append(k, data[k]);
        });
        (0, _nodeFetch.default)("".concat(_this14.server, "/").concat(route), {
          method: "POST",
          body: body
        }).then(function (result) {
          if (result.ok) {
            return result;
          } else {
            throw new Error("Request failed with status:" + result.status);
          }
        }).then(function (result) {
          var output = result.json();

          _this14.debugOut(" > Response: ", output);

          resolve((0, _immutable.fromJS)(output));
        }).catch(function (error) {
          return reject(error);
        });
      });
    } // USERS

  }, {
    key: "createUser",
    value: function createUser(id, // Podium @ ID of new user account
    pw, // Password for new user account
    name, // Display name of new user account
    bio, // Bio of new user account
    picture, // Picture, as base64 string
    ext) {
      var _this15 = this;

      return new Promise(function (resolve, reject) {
        _this15.dispatch("user", {
          id: id,
          pw: pw,
          name: name,
          bio: bio,
          picture: picture,
          ext: ext
        }).then(function (response) {
          return resolve(response);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "newUser",
    value: function newUser(id, // Podium @ ID of new user account
    pw, // Password for new user account
    name, // Display name of new user account
    bio) // Bio of new user account
    {
      var _this16 = this;

      // Registers a new podium user.
      // Podium users are represented on the ledger by 6 records
      //	1) Profile Record - stores information about the user,
      //			including their display name and bio
      //	2) POD Record - stores transactions of Podium Tokens
      //			by the user, which can be compiled to calculate
      //			the user's current POD balance
      //	3) AUD Record - stores transactions of Audium Tokens
      //			by the user, which can be compiled to calculate
      //			the user's current AUD balance
      //	4) Integrity Record - stores gains/losses of Integrity
      //			for this user, which can be compiled to calculate
      //			the user's current Integrity
      //	5) Permissions - stores records dictating the user's
      //			current permissions on Podium
      //	6) ID Ownership Record - stores a reference for the user's
      //			address to their Podium @ ID. Used to confirm
      //			account ownership, track account history, and to
      //			permit users to freely transfer their IDs
      //TODO - Require ID and pw to obey certain rulesets
      //TODO - Replace with scrypto smart contract
      // Create output promise
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var identityManager, identity, address, profileAccount, profilePayload, podAccount, podPayload, audAccount, audPayload, integrityAccount, integrityPayload, ownershipAccount, ownershipPayload, keyStore;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  //TODO - Ensure user does not already exist
                  // Create user identity
                  identityManager = new _radixdlt.RadixIdentityManager();
                  identity = identityManager.generateSimpleIdentity();
                  address = identity.account.getAddress(); // Generate user public record

                  profileAccount = _this16.route.forProfileOf(address);
                  profilePayload = {
                    record: "profile",
                    type: "profile",
                    id: id,
                    name: name,
                    bio: bio || "",
                    picture: "",
                    address: address // Generate user POD account

                  };
                  podAccount = _this16.route.forPODof(address);
                  podPayload = {
                    owner: address,
                    pod: 500,
                    from: "" // Generate user AUD account

                  };
                  audAccount = _this16.route.forAUDof(address);
                  audPayload = {
                    owner: address,
                    pod: 10,
                    from: "" // Generate user integrity record

                  };
                  integrityAccount = _this16.route.forIntegrityOf(address);
                  integrityPayload = {
                    owner: address,
                    i: 0.5,
                    from: "" // Generate record of this user's address owning this ID

                  };
                  ownershipAccount = _this16.route.forProfileWithID(id);
                  ownershipPayload = {
                    record: "ownership",
                    type: "username",
                    id: id,
                    owner: address
                  }; // Encrypt keypair

                  keyStore = _this16.route.forKeystoreOf(id, pw);

                  _radixdlt.RadixKeyStore.encryptKey(identity.keyPair, pw).then(
                  /*#__PURE__*/
                  function () {
                    var _ref2 = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee2(encryptedKey) {
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              return _context2.abrupt("return", _this16.sendRecords(identity, [keyStore], encryptedKey, [profileAccount], profilePayload, [podAccount], podPayload, [audAccount], audPayload, [integrityAccount], integrityPayload, [ownershipAccount], ownershipPayload));

                            case 1:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2, this);
                    }));

                    return function (_x4) {
                      return _ref2.apply(this, arguments);
                    };
                  }()) //TODO - Auto-follow Podium master account
                  .then(function (result) {
                    return resolve(address);
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 15:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        return function (_x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "identity",
    value: function identity(id, // User Identifier
    pw) {
      var _this17 = this;

      var setUser = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.debugOut("Signing In: ", id, pw);
      return new Promise(function (resolve, reject) {
        _this17.getLatest(_this17.route.forKeystoreOf(id, pw)).then(function (encryptedKey) {
          _this17.debugOut("Received Keypair");

          return _radixdlt.RadixKeyStore.decryptKey(encryptedKey.toJS(), pw);
        }).then(function (keyPair) {
          _this17.debugOut("Decrypted Keypair: ", keyPair);

          var ident = new _radixdlt.RadixSimpleIdentity(keyPair);

          if (setUser) {
            _this17.user = ident;
          }

          resolve(ident);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "clearUser",
    value: function clearUser() {
      this.cleanUp();
      this.user = null;
    }
  }, {
    key: "updateUserIdentifier",
    value: function updateUserIdentifier() {}
  }, {
    key: "changePassword",
    value: function changePassword() {} // USER PROFILES

  }, {
    key: "updateProfileName",
    value: function updateProfileName(name) {
      var _this18 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4(resolve, reject) {
          var address, profileAccount, profilePayload;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  // Get user address
                  address = identity.account.getAddress(); // Generate user public record

                  profileAccount = _this18.route.forProfileOf(address);
                  profilePayload = {
                    record: "profile",
                    type: "image",
                    name: name // Write record

                  };

                  _this18.sendRecord([profileAccount], profilePayload, identity).then(function () {
                    return resolve();
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 4:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        return function (_x5, _x6) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "updateProfileBio",
    value: function updateProfileBio(bio) {
      var _this19 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref4 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5(resolve, reject) {
          var address, profileAccount, profilePayload;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  // Get user address
                  address = identity.account.getAddress(); // Generate user public record

                  profileAccount = _this19.route.forProfileOf(address);
                  profilePayload = {
                    record: "profile",
                    type: "bio",
                    bio: bio // Write record

                  };

                  _this19.sendRecord([profileAccount], profilePayload, identity).then(function () {
                    return resolve();
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 4:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        return function (_x7, _x8) {
          return _ref4.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "updateProfilePicture",
    value: function updateProfilePicture(pictureAddress) {
      var _this20 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref5 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6(resolve, reject) {
          var address, profileAccount, profilePayload;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  // Get user address
                  address = identity.account.getAddress(); // Generate user public record

                  profileAccount = _this20.route.forProfileOf(address);
                  profilePayload = {
                    record: "profile",
                    type: "image",
                    picture: pictureAddress // Write record

                  };

                  _this20.sendRecord([profileAccount], profilePayload, identity).then(function () {
                    return resolve();
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 4:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        return function (_x9, _x10) {
          return _ref5.apply(this, arguments);
        };
      }());
    } //TODO - handle multiple simultaneous requests
    //		 for the same record without multiple
    //		 calls to the network

  }, {
    key: "fetchProfile",
    value: function fetchProfile(target) // Set true if passing an ID instead of an address
    {
      var _this21 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this21.getLatest(_this21.route.forProfileWithID(target)).then(function (reference) {
            return resolve(_this21.fetchProfile(reference.get("owner")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this21.getHistory(_this21.route.forProfileOf(target)).then(function (history) {
            var profile = history.reduce(function (a, b) {
              return a.mergeDeep(b);
            });
            resolve(profile.set("pictureURL", "https://".concat(_this21.media, "/").concat(profile.get("picture"))));
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    } // TOPICS

  }, {
    key: "createTopic",
    value: function createTopic(id, // Unique identifier for topic
    name, // Display name of topic
    description, // Description of topic
    owner) {
      var _this22 = this;

      var identity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Resolve topic address
        var topicAccount = _this22.route.forTopicWithID(id);

        var topicAddress = topicAccount.getAddress(); // Build topic record

        var topicRecord = {
          record: "topic",
          type: "topic",
          id: id,
          name: name,
          description: description,
          owner: owner,
          address: topicAddress //TODO - Topic ownership record
          // Store topic

        };

        _this22.sendRecord([topicAccount], topicRecord, identity) //TODO - Add topic to index database
        .then(function (result) {
          return resolve((0, _immutable.fromJS)(topicRecord));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchTopic",
    value: function fetchTopic(target) // Set true if passing an ID instead of an address
    {
      var _this23 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this23.getLatest(_this23.route.forTopicWithID(target)).then(function (reference) {
            return resolve(_this23.fetchTopic(reference.get("owner")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this23.getLatest(_this23.route.forTopic(target)).then(function (topic) {
            return resolve(topic);
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    } // POSTS

  }, {
    key: "createPost",
    value: function createPost(content) {
      var _this24 = this;

      var references = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var identity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Get user data
        var userAddress = identity.account.getAddress(); // Build post accounts
        //TODO - Fix deterministic posting addresses
        //const postAccount = this.route.forNextPostBy(this.state.data.get("user"));

        var postAccount = _this24.route.forNewPost(content);

        var postAddress = postAccount.getAddress(); // Build post record

        var postRecord = {
          record: "post",
          type: "post",
          content: content,
          address: postAddress,
          author: userAddress,
          parent: parent ? parent.get("address") : null,
          grandparent: parent ? parent.get("parent") : null,
          origin: parent ? parent.get("origin") : postAddress,
          depth: parent ? parent.get("depth") + 1 : 0,
          mentions: references.filter(function (ref) {
            return ref.get("type") === "mention";
          }).map(function (ref) {
            return ref.get("address");
          }).toList().toJS(),
          topics: references.filter(function (ref) {
            return ref.get("type") === "topics";
          }).map(function (ref) {
            return ref.get("address");
          }).toList().toJS(),
          media: [] // Build destination accounts for references

        };
        var refAccounts = references.map(function (ref) {
          var address = ref.get("address");

          switch (ref.get("type")) {
            case "topic":
              return _this24.route.forPostsAboutTopic(address);
            //TODO - Links and other references
            //TODO - Mentions of users...?

            default:
              return (0, _immutable.List)();
          }
        }).toList(); // Build destination accounts for index record

        var indexAccounts = [_this24.route.forPostsBy(userAddress)].concat(_toConsumableArray(replyIndex), _toConsumableArray(refAccounts));
        var indexRecord = {
          record: "post",
          type: "index",
          address: postAddress // Build alert payload

        };
        var mentionAccounts = references //.filter(ref => ref.get("address") !== userAddress)
        .map(function (ref) {
          var address = ref.get("address");

          switch (ref.get("type")) {
            case "mention":
              return _this24.route.forAlertsTo(address);

            default:
              return (0, _immutable.List)();
          }
        }).toList();
        var mentionRecord = {
          record: "alert",
          type: "mention",
          post: postAddress,
          user: userAddress // Check if post is a reply

        };

        if (parent) {
          // Build reply index
          var replyAccount = _this24.route.forRepliesToPost(parent.get("address")); // Build reply alert


          var replyAlertAccount = _this24.route.forAlertsTo(parent.get("author"));

          var replyAlertRecord = {
            record: "alert",
            type: "reply",
            post: postAddress,
            user: userAddress // Store records in ledger

          };

          _this24.sendRecords(identity, [postAccount], postRecord, [replyAccount].concat(_toConsumableArray(indexAccounts)), indexRecord, mentionAccounts, mentionRecord, [replyAlertAccount], replyAlertRecord).then(function (result) {
            return resolve((0, _immutable.fromJS)(postRecord));
          }).catch(function (error) {
            return reject(error);
          }); // ...otherwise, send the basic records

        } else {
          // Store records in ledger
          _this24.sendRecords(identity, [postAccount], postRecord, indexAccounts, indexRecord, mentionAccounts, mentionRecord).then(function (result) {
            return resolve((0, _immutable.fromJS)(postRecord));
          }).catch(function (error) {
            return reject(error);
          });
        }
      });
    }
  }, {
    key: "promotePost",
    value: function promotePost(postAddress, // Address of the promoted post
    authorAddress // Address of the post's author
    ) {
      var _this25 = this;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Get user data
        var userAddress = identity.account.getAddress(); // Get account for the promoting user's posts

        var postAccount = _this25.route.forPostsBy(userAddress);

        var postRecord = {
          record: "post",
          type: "promotion",
          address: postAddress // Get account for logging promotions of target post

        };

        var promoteAccount = _this25.route.forPromosOfPost(postAddress);

        var promoteRecord = {
          record: "post",
          type: "promotion",
          address: postAddress,
          by: userAddress // Build alert payload

        };

        var alertAccount = _this25.route.forAlertsTo(authorAddress);

        var alertRecord = {
          record: "alert",
          type: "promotion",
          post: postAddress,
          user: userAddress // Store records in ledger

        };

        _this25.sendRecords(identity, [postAccount], postRecord, [promoteAccount], promoteRecord, [alertAccount], alertRecord).then(function (result) {
          return resolve((0, _immutable.fromJS)(postRecord));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchPost",
    value: function fetchPost(address) {
      var _this26 = this;

      return new Promise(function (resolve, reject) {
        _this26.getHistory(_this26.route.forPost(address)) // Collate post history into a single object
        .then(function (postHistory) {
          return postHistory.reduce(function (post, next) {
            // TODO - Merge edits and retractions
            //		  into a single cohesive map
            // Collate timestamps
            var lastTime = post.get("created");
            var nextTime = next.get("created");
            var created;
            var latest;

            if (lastTime && nextTime) {
              created = Math.min(lastTime, nextTime);
              latest = Math.max(lastTime, nextTime);
            } else {
              created = lastTime || nextTime;
              latest = lastTime || nextTime;
            } // Return completed post


            resolve(post.mergeDeep(next).set("created", created).set("latest", latest));
          }, (0, _immutable.Map)({}));
        }) // Handle errors
        .catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchRepliesTo",
    value: function fetchRepliesTo(address) {
      var _this27 = this;

      return new Promise(function (resolve, reject) {
        _this27.getHistory(_this27.route.forRepliesToPost(address)).then(function (replies) {
          return replies.map(function (r) {
            return r.get("address");
          }).toList();
        }).then(function (replies) {
          return resolve(replies);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchPromotionsOf",
    value: function fetchPromotionsOf(address) {
      var _this28 = this;

      return new Promise(function (resolve, reject) {
        _this28.getHistory(_this28.route.forPromosOfPost(address)).then(function (promos) {
          return resolve(promos);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "listenPosts",
    value: function listenPosts(address, callback) {
      this.openChannel(this.route.forPostsBy(address), callback);
    }
  }, {
    key: "reportPost",
    value: function reportPost() {}
  }, {
    key: "amendPost",
    value: function amendPost() {}
  }, {
    key: "retractPost",
    value: function retractPost() {} // ALERTS

  }, {
    key: "listenAlerts",
    value: function listenAlerts(address, callback) {
      this.openChannel(this.route.forAlertsTo(address), callback);
    } // FOLLOWING

  }, {
    key: "listenFollow",
    value: function listenFollow(address, callback) {
      this.openChannel(this.route.forUsersFollowedBy(address), callback);
    }
  }, {
    key: "followUser",
    value: function followUser(followAddress) {
      var _this29 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;

      if (identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        var _followingRecord;

        //TODO - Check user is not already following the subject user
        // Get user data
        var userAddress = identity.account.getAddress(); // Build follow account payload

        var followAccount = _this29.route.forUsersFollowing(userAddress);

        var followRecord = {
          record: "follower",
          type: "index",
          address: userAddress
        }; // Build relation account and payload

        var relationAccount = _this29.route.forRelationOf(userAddress, followAddress);

        var relationRecord = {
          record: "follower",
          type: "relation",
          users: [userAddress, followAddress],
          following: true // Build following payload

        };

        var followingAccount = _this29.route.forUsersFollowedBy(userAddress);

        var followingRecord = (_followingRecord = {
          type: "following"
        }, _defineProperty(_followingRecord, "type", "index"), _defineProperty(_followingRecord, "address", followAddress), _followingRecord); // Build alert payload

        var alertAccount = _this29.route.forAlertsTo(followAddress);

        var alertRecord = {
          record: "alert",
          type: "follow",
          user: userAddress // Store following record

        };

        _this29.sendRecords(identity, [followAccount], followRecord, [relationAccount], relationRecord, [followingAccount], followingRecord, [alertAccount], alertRecord) //TODO - Alerts system
        .then(function (result) {
          return resolve(result);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchUsersFollowed",
    value: function fetchUsersFollowed() {
      var _this30 = this;

      var identity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.user;
      return new Promise(function (resolve, reject) {
        // Get user data
        var userAddress = identity.account.getAddress(); // Get location for records of followed users

        var followAccount = _this30.route.forUsersFollowedBy(userAddress); // Load followers


        _this30.getHistory(followAccount).then(function (followed) {
          return followed.filter(
          /*#__PURE__*/
          function () {
            var _ref6 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee7(f) {
              var relationAccount;
              return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      relationAccount = _this30.route.forRelationOf(userAddress, f.get("address"));
                      _context7.next = 3;
                      return _this30.getLatest(relationAccount).then(function (relation) {
                        return relation.get("following");
                      }).catch(function (error) {
                        return reject(error);
                      });

                    case 3:
                      return _context7.abrupt("return", _context7.sent);

                    case 4:
                    case "end":
                      return _context7.stop();
                  }
                }
              }, _callee7, this);
            }));

            return function (_x11) {
              return _ref6.apply(this, arguments);
            };
          }());
        }).then(function (followed) {
          return resolve(followed);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchUsersFollowing",
    value: function fetchUsersFollowing(address) {
      var _this31 = this;

      return new Promise(function (resolve, reject) {
        // Get location for records of followed users
        var followingAccount = _this31.route.forUsersFollowing(address); // Load following users


        _this31.getHistory(followingAccount, identity).then(function (followed) {
          return followed.filter(
          /*#__PURE__*/
          function () {
            var _ref7 = _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee8(f) {
              var relationAccount;
              return regeneratorRuntime.wrap(function _callee8$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      relationAccount = _this31.route.forRelationOf(address, f.get("address"));
                      _context8.next = 3;
                      return _this31.getLatest(relationAccount).then(function (relation) {
                        return relation.get("follow");
                      }).catch(function (error) {
                        return reject(error);
                      });

                    case 3:
                      return _context8.abrupt("return", _context8.sent);

                    case 4:
                    case "end":
                      return _context8.stop();
                  }
                }
              }, _callee8, this);
            }));

            return function (_x12) {
              return _ref7.apply(this, arguments);
            };
          }());
        }).then(function (followed) {
          return resolve(followed);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "unfollowUser",
    value: function unfollowUser(followAddress) {
      var _this32 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;

      if (identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        //TODO - Check user is currently following the user to be unfollowed
        // Get user data
        var userAddress = identity.account.getAddress(); // Build relation account and payload

        var relationAccount = _this32.route.forRelationOf(userAddress, followAddress);

        var relationRecord = {
          record: "follower",
          type: "relation",
          users: [userAddress, followAddress],
          follow: false // Store following record

        };

        _this32.sendRecord([relationAccount], relationRecord, identity) //TODO - Alerts system
        .then(function (result) {
          return resolve(result);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }]);

  return Podix;
}();

exports.default = Podix;
