"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _radixdlt = require("radixdlt");

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
      fetch(this.server).then(function (response) {
        if (!response.ok) {
          throw new PodiumError("Server Offline").withCode(0);
        } else {
          fetch(_this2.server + "/config").then(function (response) {
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
      // Extract settings from config
      this.app = config.ApplicationID;
      this.timeout = config.Timeout;
      this.lifetime = config.Lifetime;
      this.server = config.API;
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

      if (debug) {
        _radixdlt.RadixLogger.setLevel('error');
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
          _radixdlt.RadixTransactionBuilder.createPayloadAtom(accounts, _this5.app, JSON.stringify(payload), encrypt).signAndSubmit(identity).subscribe({
            complete: function complete() {
              return resolve(true);
            },
            next: function next(status) {
              return console.log(status);
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
            if (skipper) {
              clearTimeout(skipper);
            }

            var record = (0, _immutable.Map)((0, _immutable.fromJS)(JSON.parse(item.data.payload))).set("received", new Date().getTime()).set("created", item.data.timestamp);
            history = history.push(record); // Assume all records collated 1 second after first
            // (This won't work long-term, but serves as an
            // efficient fix for the timeout issue until the
            // radix lib can flag a channel as up to date).

            skipper = setTimeout(function () {
              channel.unsubscribe();
              resolve(history);
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
            resolve(history);
          } else {
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
        var body = new FormData();
        body.append("file", mediaFile);
        body.append("address", address);
        fetch("https://".concat(_this11.server, "/media"), {
          method: "POST",
          body: body
        }).then(function (response) {
          return resolve(response);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "createMedia",
    value: function createMedia(file) {
      var _this12 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        //TODO - Validate media with 3rd party service
        //		 to detect image manipulation, etc...
        // Register media on ledger
        var address = identity.account.getAddress();
        var fileAddress = _this12.route.forMedia(file).getAddress() + "." + file.split(",")[0].split("/")[1].split(";")[0]; // Generate file record
        //TODO - Ensure media address is independent of
        //		 the uploading user so the same image
        //		 uploaded by different users is still
        //		 only stored once on S3.

        var mediaAccount = _this12.route.forMediaFrom(address);

        var mediaPayload = {
          record: "media",
          type: "image",
          address: fileAddress // Register media on ledger
          //TODO - Check if media already exists and skip
          //		 this step, if required

        };

        _this12.sendRecord([mediaAccount], mediaPayload, identity).then(function () {
          return _this12.uploadMedia(file, fileAddress);
        }).then(function () {
          return resolve(fileAddress);
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
    picture) // Picture address (in media archive) of user's profile picture
    {
      var _this13 = this;

      return new Promise(function (resolve, reject) {
        fetch("https://".concat(_this13.server, "/user"), {
          method: "POST",
          body: {
            id: id,
            pw: pw,
            name: name,
            bio: bio,
            picture: picture
          }
        }).promise().then(function (response) {
          console.log("Create User Response", response);
          resolve(response);
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
    bio, // Bio of new user account
    picture) {
      var _this14 = this;

      var setUser = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
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
          var identityManager, identity, address, pictureAddress, profileAccount, profilePayload, podAccount, podPayload, audAccount, audPayload, integrityAccount, integrityPayload, ownershipAccount, ownershipPayload, keyStore;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  // Create user identity
                  identityManager = new _radixdlt.RadixIdentityManager();
                  identity = identityManager.generateSimpleIdentity();
                  address = identity.account.getAddress(); //TODO - Store picture, if present

                  if (!picture) {
                    _context3.next = 7;
                    break;
                  }

                  _context3.next = 6;
                  return _this14.createMedia(picture, identity);

                case 6:
                  pictureAddress = _context3.sent;

                case 7:
                  // Generate user public record
                  profileAccount = _this14.route.forProfileOf(address);
                  profilePayload = {
                    record: "user",
                    type: "profile",
                    id: id,
                    name: name,
                    bio: bio,
                    picture: pictureAddress,
                    address: address // Generate user POD account

                  };
                  podAccount = _this14.route.forPODof(address);
                  podPayload = {
                    owner: address,
                    pod: 500,
                    from: "" // Generate user AUD account

                  };
                  audAccount = _this14.route.forAUDof(address);
                  audPayload = {
                    owner: address,
                    pod: 10,
                    from: "" // Generate user integrity record

                  };
                  integrityAccount = _this14.route.forIntegrityOf(address);
                  integrityPayload = {
                    owner: address,
                    i: 0.5,
                    from: "" // Generate record of this user's address owning this ID

                  };
                  ownershipAccount = _this14.route.forProfileWithID(id);
                  ownershipPayload = {
                    id: id,
                    owner: address
                  }; // Encrypt keypair

                  keyStore = _this14.route.forKeystoreOf(id, pw);

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
                              return _context2.abrupt("return", _this14.sendRecords(identity, [keyStore], encryptedKey, [profileAccount], profilePayload, [podAccount], podPayload, [audAccount], audPayload, [integrityAccount], integrityPayload, [ownershipAccount], ownershipPayload));

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
                  }()) //TODO - Add this user to the index database
                  //TODO - Auto-follow Podium master account
                  .then(function (result) {
                    if (setUser) {
                      _this14.user = identity;
                    }

                    resolve(address);
                  }).catch(function (error) {
                    return reject(error);
                  });

                case 19:
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
    key: "setUser",
    value: function setUser(id, // User Identifier
    pw // User password
    ) {
      var _this15 = this;

      return new Promise(function (resolve, reject) {
        _this15.getLatest(_this15.route.forKeystoreOf(id, pw)).then(function (encryptedKey) {
          return _radixdlt.RadixKeyStore.decryptKey(encryptedKey.toJS(), pw);
        }).then(function (keyPair) {
          _this15.user = new _radixdlt.RadixSimpleIdentity(keyPair);
          resolve(true);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "updateUserIdentifier",
    value: function updateUserIdentifier() {}
  }, {
    key: "swapUserIdentifiers",
    value: function swapUserIdentifiers() {} // USER PROFILES

  }, {
    key: "updateUserDisplayName",
    value: function updateUserDisplayName() {}
  }, {
    key: "updateUserBio",
    value: function updateUserBio() {}
  }, {
    key: "updateUserPicture",
    value: function updateUserPicture() {} //TODO - handle multiple simultaneous requests
    //		 for the same record without multiple
    //		 calls to the network

  }, {
    key: "fetchProfile",
    value: function fetchProfile(target) // Set true if passing an ID instead of an address
    {
      var _this16 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this16.getLatest(_this16.route.forProfileWithID(target)).then(function (reference) {
            return resolve(_this16.fetchProfile(reference.get("address")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this16.getLatest(_this16.route.forProfileOf(target)).then(function (result) {
            var profile = result.update("picture", function (p) {
              return "https://".concat(_this16.media, "/").concat(p);
            });
            resolve(profile);
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
      var _this17 = this;

      var identity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.user;

      if (!identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Resolve topic address
        var topicAccount = _this17.route.forTopicWithID(id);

        var topicAddress = topicAccount.getAddress(); // Build topic record

        var topicRecord = {
          record: "topic",
          type: "topic",
          id: id,
          name: name,
          description: description,
          owner: owner,
          address: topicAddress // Store topic

        };

        _this17.sendRecord([topicAccount], topicRecord, identity) //TODO - Add topic to index database
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
      var _this18 = this;

      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        // Search on ID or Address
        if (id) {
          // Search on ID
          _this18.getLatest(_this18.route.forTopicWithID(target)).then(function (reference) {
            return resolve(_this18.fetchTopic(reference.get("address")));
          }).catch(function (error) {
            return reject(error);
          });
        } else {
          // Search on address
          _this18.getLatest(_this18.route.forTopic(target)).then(function (topic) {
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
      var _this19 = this;

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

        var postAccount = _this19.route.forNewPost(content);

        var postAddress = postAccount.getAddress(); // Build post record

        var postRecord = {
          record: "post",
          // origin, amendment, retraction
          type: "post",
          content: content,
          address: postAddress,
          author: userAddress,
          parent: parent ? parent.get("address") : null,
          origin: parent ? parent.get("origin") : postAddress,
          depth: parent ? parent.get("depth") + 1 : 0 // Build reference payload and destination accounts

        };
        var refAccounts = [_this19.route.forPostsBy(userAddress) //TODO - Add to other indexes for topics, mentions, links
        ];
        var refRecord = {
          record: "post",
          type: "reference",
          address: postAddress // Build alert payload
          //TODO - build alerts system
          // const alertAccounts = []
          // const alertRecord = {
          // 	record: "alert",
          // 	type: "mention",
          // 	address: postAddress,
          // 	by: userAddress
          // 	created: time
          // }
          // Store records in ledger

        };

        _this19.sendRecords(identity, [postAccount], postRecord, refAccounts, refRecord).then(function (result) {
          return resolve((0, _immutable.fromJS)(postRecord));
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "fetchPost",
    value: function fetchPost(address) {
      var _this20 = this;

      return new Promise(function (resolve, reject) {
        _this20.getHistory(_this20.route.forPost(address)).then(function (postHistory) {
          return resolve(postHistory.reduce(function (p, nxt) {
            // TODO - Merge edits and retractions
            //		  into a single cohesive map
            return p.mergeDeep(nxt);
          }, (0, _immutable.Map)({})));
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
    key: "promotePost",
    value: function promotePost(address, // Radix address of post to be promoted
    promoter, // Radix address of user promoting said post
    pod) // Audium spent promoting the post
    {
      var aud = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      console.log("PROMOTED POST ", address);
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
      var _this21 = this;

      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.user;

      if (identity) {
        throw new Error("Missing Identity");
      }

      return new Promise(function (resolve, reject) {
        // Get user data
        var userAddress = identity.account.getAddress(); // Build follow account payload

        var followAccount = _this21.route.forFollowing(userAddress);

        var followRecord = {
          type: "follower index",
          address: userAddress
        }; // Build relation account and payload

        var relationAccount = _this21.route.forRelationOf(userAddress, followAddress);

        var relationRecord = {
          type: "follower record",
          users: [userAddress, followAddress],
          follow: true
        }; // Build following payload

        var followingAccount = _this21.route.forFollowsBy(userAddress);

        var followingRecord = {
          type: "following index",
          address: followAddress
        }; // Store following record

        _this21.sendRecords(identity, [followAccount], followRecord, [relationAccount], relationRecord, [followingAccount], followingRecord) //TODO - Alerts system
        .then(function (result) {
          return resolve(result);
        }).catch(function (error) {
          return reject(error);
        });
      });
    }
  }, {
    key: "unfollowUser",
    value: function unfollowUser() {}
  }]);

  return Podix;
}();

exports.default = Podix;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJnZXRBY2NvdW50Iiwic2VlZCIsImhhc2giLCJSYWRpeFV0aWwiLCJCdWZmZXIiLCJmcm9tIiwiUmFkaXhBY2NvdW50IiwiUmFkaXhLZXlQYWlyIiwiZnJvbVByaXZhdGUiLCJQb2RpdW1FcnJvciIsImFyZ3MiLCJwb2RpdW1FcnJvciIsIkVycm9yIiwiY2FwdHVyZVN0YWNrVHJhY2UiLCJjb2RlIiwiUm91dGVzIiwiZnJvbUFkZHJlc3MiLCJhZGRyZXNzIiwiaWQiLCJwdyIsInRvTG93ZXJDYXNlIiwidXNlciIsImdldCIsInBvc3QiLCJmaWxlIiwiSlNPTiIsInN0cmluZ2lmeSIsImFkZHJlc3MxIiwiYWRkcmVzczIiLCJQb2RpeCIsImNvbmZpZyIsImRlYnVnIiwicm91dGUiLCJjaGFubmVscyIsInRpbWVycyIsInNldERlYnVnIiwic2VydmVyIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsIndpdGhDb2RlIiwianNvbiIsImNvbm5lY3QiLCJhcHAiLCJBcHBsaWNhdGlvbklEIiwidGltZW91dCIsIlRpbWVvdXQiLCJsaWZldGltZSIsIkxpZmV0aW1lIiwiQVBJIiwibWVkaWEiLCJNZWRpYVN0b3JlIiwiVW5pdmVyc2UiLCJyYWRpeFVuaXZlcnNlIiwiYm9vdHN0cmFwIiwiUmFkaXhVbml2ZXJzZSIsIlNVTlNUT05FIiwiSElHSEdBUkRFTiIsIkFMUEhBTkVUIiwiY2xlYW5VcFRpbWVycyIsImNsZWFuVXBDaGFubmVscyIsIlJhZGl4TG9nZ2VyIiwic2V0TGV2ZWwiLCJkdXJhdGlvbiIsImNhbGxiYWNrIiwidGltZXIiLCJzZXRUaW1lb3V0IiwiZGVsZXRlIiwiY2xlYXJUaW1lb3V0IiwibmV3VGltZXIiLCJtYXAiLCJ0Iiwic3RvcFRpbWVyIiwiYWNjb3VudHMiLCJwYXlsb2FkIiwiaWRlbnRpdHkiLCJlbmNyeXB0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJsZW5ndGgiLCJSYWRpeFRyYW5zYWN0aW9uQnVpbGRlciIsImNyZWF0ZVBheWxvYWRBdG9tIiwic2lnbkFuZFN1Ym1pdCIsInN1YnNjcmliZSIsImNvbXBsZXRlIiwibmV4dCIsInN0YXR1cyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiYXJndW1lbnRzIiwic2VuZFJlY29yZCIsInJlc3VsdCIsInNlbmRSZWNvcmRzIiwiY2F0Y2giLCJhY2NvdW50Iiwib3Blbk5vZGVDb25uZWN0aW9uIiwic3RyZWFtIiwiZGF0YVN5c3RlbSIsImdldEFwcGxpY2F0aW9uRGF0YSIsInNraXBwZXIiLCJoaXN0b3J5IiwiY2hhbm5lbCIsIml0ZW0iLCJyZWNvcmQiLCJwYXJzZSIsImRhdGEiLCJzZXQiLCJEYXRlIiwiZ2V0VGltZSIsInRpbWVzdGFtcCIsInB1c2giLCJ1bnN1YnNjcmliZSIsInNpemUiLCJnZXRIaXN0b3J5Iiwic29ydCIsImEiLCJiIiwibGFzdCIsIm9uRXJyb3IiLCJnZXRBZGRyZXNzIiwiYXBwbGljYXRpb25EYXRhU3ViamVjdCIsImNsb3NlQ2hhbm5lbCIsInJlc2V0VGltZXIiLCJjIiwibWVkaWFGaWxlIiwiYm9keSIsIkZvcm1EYXRhIiwiYXBwZW5kIiwibWV0aG9kIiwiZmlsZUFkZHJlc3MiLCJmb3JNZWRpYSIsInNwbGl0IiwibWVkaWFBY2NvdW50IiwiZm9yTWVkaWFGcm9tIiwibWVkaWFQYXlsb2FkIiwidHlwZSIsInVwbG9hZE1lZGlhIiwibmFtZSIsImJpbyIsInBpY3R1cmUiLCJwcm9taXNlIiwic2V0VXNlciIsImlkZW50aXR5TWFuYWdlciIsIlJhZGl4SWRlbnRpdHlNYW5hZ2VyIiwiZ2VuZXJhdGVTaW1wbGVJZGVudGl0eSIsImNyZWF0ZU1lZGlhIiwicGljdHVyZUFkZHJlc3MiLCJwcm9maWxlQWNjb3VudCIsImZvclByb2ZpbGVPZiIsInByb2ZpbGVQYXlsb2FkIiwicG9kQWNjb3VudCIsImZvclBPRG9mIiwicG9kUGF5bG9hZCIsIm93bmVyIiwicG9kIiwiYXVkQWNjb3VudCIsImZvckFVRG9mIiwiYXVkUGF5bG9hZCIsImludGVncml0eUFjY291bnQiLCJmb3JJbnRlZ3JpdHlPZiIsImludGVncml0eVBheWxvYWQiLCJpIiwib3duZXJzaGlwQWNjb3VudCIsImZvclByb2ZpbGVXaXRoSUQiLCJvd25lcnNoaXBQYXlsb2FkIiwia2V5U3RvcmUiLCJmb3JLZXlzdG9yZU9mIiwiUmFkaXhLZXlTdG9yZSIsImVuY3J5cHRLZXkiLCJrZXlQYWlyIiwiZW5jcnlwdGVkS2V5IiwiZ2V0TGF0ZXN0IiwiZGVjcnlwdEtleSIsInRvSlMiLCJSYWRpeFNpbXBsZUlkZW50aXR5IiwidGFyZ2V0IiwicmVmZXJlbmNlIiwiZmV0Y2hQcm9maWxlIiwicHJvZmlsZSIsInVwZGF0ZSIsInAiLCJkZXNjcmlwdGlvbiIsInRvcGljQWNjb3VudCIsImZvclRvcGljV2l0aElEIiwidG9waWNBZGRyZXNzIiwidG9waWNSZWNvcmQiLCJmZXRjaFRvcGljIiwiZm9yVG9waWMiLCJ0b3BpYyIsImNvbnRlbnQiLCJyZWZlcmVuY2VzIiwicGFyZW50IiwidXNlckFkZHJlc3MiLCJwb3N0QWNjb3VudCIsImZvck5ld1Bvc3QiLCJwb3N0QWRkcmVzcyIsInBvc3RSZWNvcmQiLCJhdXRob3IiLCJvcmlnaW4iLCJkZXB0aCIsInJlZkFjY291bnRzIiwiZm9yUG9zdHNCeSIsInJlZlJlY29yZCIsImZvclBvc3QiLCJwb3N0SGlzdG9yeSIsInJlZHVjZSIsIm54dCIsIm1lcmdlRGVlcCIsIm9wZW5DaGFubmVsIiwicHJvbW90ZXIiLCJhdWQiLCJmb3JBbGVydHNUbyIsImZvclVzZXJzRm9sbG93ZWRCeSIsImZvbGxvd0FkZHJlc3MiLCJmb2xsb3dBY2NvdW50IiwiZm9yRm9sbG93aW5nIiwiZm9sbG93UmVjb3JkIiwicmVsYXRpb25BY2NvdW50IiwiZm9yUmVsYXRpb25PZiIsInJlbGF0aW9uUmVjb3JkIiwidXNlcnMiLCJmb2xsb3ciLCJmb2xsb3dpbmdBY2NvdW50Iiwi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QXRCdUMsQ0EyQnZDOztBQUNBLFFBQUEsT0FBSSxDQUFDekgsV0FBTCxDQUNFdkIsUUFERixFQUVFLENBQUNpSixhQUFELENBRkYsRUFFbUJFLFlBRm5CLEVBR0UsQ0FBQ0MsZUFBRCxDQUhGLEVBR3FCRSxjQUhyQixFQUlFLENBQUNHLGdCQUFELENBSkYsRUFJc0JFLGVBSnRCLEVBTUM7QUFORCxTQU9Fak0sSUFQRixDQU9PLFVBQUM0RCxNQUFEO0FBQUEsaUJBQVluQixPQUFPLENBQUNtQixNQUFELENBQW5CO0FBQUEsU0FQUCxFQVFFRSxLQVJGLENBUVEsVUFBQVQsS0FBSztBQUFBLGlCQUFJWCxNQUFNLENBQUNXLEtBQUQsQ0FBVjtBQUFBLFNBUmI7QUFVQSxPQXRDTSxDQUFQO0FBd0NBOzs7bUNBR2MsQ0FBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZyb21KUywgTWFwLCBMaXN0IH0gZnJvbSAnaW1tdXRhYmxlJztcblxuaW1wb3J0IHsgcmFkaXhVbml2ZXJzZSwgUmFkaXhVbml2ZXJzZSwgUmFkaXhMb2dnZXIsXG5cdFx0IFJhZGl4QWNjb3VudCwgUmFkaXhVdGlsLCBSYWRpeEtleVBhaXIsXG5cdFx0IFJhZGl4U2ltcGxlSWRlbnRpdHksIFJhZGl4SWRlbnRpdHlNYW5hZ2VyLFxuXHRcdCBSYWRpeEtleVN0b3JlLCBSYWRpeFRyYW5zYWN0aW9uQnVpbGRlciB9IGZyb20gJ3JhZGl4ZGx0JztcblxuXG5cblxuZnVuY3Rpb24gZ2V0QWNjb3VudChzZWVkKSB7XG5cdGNvbnN0IGhhc2ggPSBSYWRpeFV0aWwuaGFzaChCdWZmZXIuZnJvbShzZWVkKSk7XG5cdHJldHVybiBuZXcgUmFkaXhBY2NvdW50KFJhZGl4S2V5UGFpci5mcm9tUHJpdmF0ZShoYXNoKSk7XG59XG5cblxuXG5cbmNsYXNzIFBvZGl1bUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXG5cdGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcblx0XHRzdXBlciguLi5hcmdzKVxuXHRcdHRoaXMucG9kaXVtRXJyb3IgPSB0cnVlO1xuXHRcdEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIFBvZGl1bUVycm9yKVxuXHR9XG5cblx0d2l0aENvZGUoY29kZSkge1xuXHRcdHRoaXMuY29kZSA9IGNvZGU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRyZXBvcnQoKSB7XG5cdFx0c3dpdGNoICh0aGlzLmNvZGUpIHtcblx0XHRcdGNhc2UgKDApOiBcblx0XHRcdFx0cmV0dXJuIFwiU2VydmVyIE9mZmxpbmUuXCJcblx0XHRcdGNhc2UgKDEpOlxuXHRcdFx0XHRyZXR1cm4gXCJObyBkYXRhIHJlY2VpdmVkLlwiXG5cdFx0XHRjYXNlICgyKTpcblx0XHRcdFx0cmV0dXJuIFwiVGltZWQgb3V0LlwiXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gXCJVbmtub3duIGVycm9yLlwiXG5cdFx0fVxuXHR9XG5cbn1cblxuXG5cblxuY2xhc3MgUm91dGVzIHtcblxuXHRmYXVjZXQoKSB7XG5cdFx0cmV0dXJuIFJhZGl4QWNjb3VudC5mcm9tQWRkcmVzcyhcblx0XHRcdCc5aGU5NHRWZlFHQVZyNHhvVXBHM3VKZkIyZXhVUkV4ekZWNkU3ZHE0YnhVV1JiTTVFZGQnLCB0cnVlKTtcblx0fVxuXG5cdC8vIFVzZXJzXG5cdGZvclByb2ZpbGVPZihhZGRyZXNzKSB7XG5cdFx0cmV0dXJuIFJhZGl4QWNjb3VudC5mcm9tQWRkcmVzcyhhZGRyZXNzKVxuXHR9XG5cdGZvcktleXN0b3JlT2YoaWQsIHB3KSB7XG5cdFx0cmV0dXJuIGdldEFjY291bnQoXCJwb2RpdW0ta2V5c3RvcmUtZm9yLVwiICsgaWQudG9Mb3dlckNhc2UoKSArIHB3KVxuXHR9XG5cdGZvclByb2ZpbGVXaXRoSUQoaWQpIHtcblx0XHRyZXR1cm4gZ2V0QWNjb3VudChcInBvZGl1bS1vd25lcnNoaXAtb2YtaWQtXCIgKyBpZC50b0xvd2VyQ2FzZSgpKVxuXHR9XG5cdGZvckludGVncml0eU9mKGFkZHJlc3MpIHtcblx0XHRyZXR1cm4gZ2V0QWNjb3VudChcInBvZGl1bS1pbnRlZ3JpdHktc2NvcmUtb2YtXCIgKyBhZGRyZXNzKTtcblx0fVxuXG5cdC8vIFRva2Vuc1xuXHRmb3JQT0RvZihhZGRyZXNzKSB7XG5cdFx0cmV0dXJuIGdldEFjY291bnQoXCJwb2RpdW0tdG9rZW4tdHJhbnNhY3Rpb25zLW9mLVwiICsgYWRkcmVzcyk7XG5cdH1cblx0Zm9yQVVEb2YoYWRkcmVzcykge1xuXHRcdHJldHVybiBnZXRBY2NvdW50KFwiYXVkaXVtLXRva2VuLXRyYW5zYWN0aW9ucy1vZi1cIiArIGFkZHJlc3MpO1xuXHR9XG5cblx0Ly8gVG9waWNzXG5cdGZvclRvcGljKGFkZHJlc3MpIHtcblx0XHRyZXR1cm4gUmFkaXhBY2NvdW50LmZyb21BZGRyZXNzKGFkZHJlc3MpXG5cdH1cblx0Zm9yVG9waWNXaXRoSUQoaWQpIHtcblx0XHRyZXR1cm4gZ2V0QWNjb3VudChcInBvZGl1bS10b3BpYy13aXRoLWlkLVwiICsgaWQudG9Mb3dlckNhc2UoKSk7XG5cdH1cblx0Zm9yUG9zdHNBYm91dFRvcGljKGFkZHJlc3MpIHtcblx0XHRyZXR1cm4gZ2V0QWNjb3VudChcInBvZGl1bS1wb3N0cy1hYm91dC10b3BpYy1cIiArIGFkZHJlc3MpXG5cdH1cblx0XG5cblx0Ly8gUG9zdHNcblx0Zm9yUG9zdHNCeShhZGRyZXNzKSB7XG5cdFx0cmV0dXJuIGdldEFjY291bnQoXCJwb2RpdW0tcG9zdHMtYnktdXNlci1cIiArIGFkZHJlc3MpXG5cdH1cblx0Zm9yUG9zdChhZGRyZXNzKSB7XG5cdFx0cmV0dXJuIFJhZGl4QWNjb3VudC5mcm9tQWRkcmVzcyhhZGRyZXNzKVxuXHR9XG5cdGZvck5leHRQb3N0QnkodXNlcikge1xuXHRcdC8vIFRPRE8gLSBGaXggdGhpcyBzbyBwb3N0cyBhcmUgc3RvcmVkIGRldGVybWluaXN0aWNseSBhZ2FpblxuXHRcdHJldHVybiBnZXRBY2NvdW50KFwicG9kaXVtLXBvc3QtYnktXCIgKyB1c2VyLmdldChcImFkZHJlc3NcIikgK1xuXHRcdFx0ICAgICAgICAgICAgICBcIi1cIiArICh1c2VyLmdldChcInBvc3RzXCIpICsgdXNlci5nZXQoXCJwZW5kaW5nXCIpKSk7XG5cdH1cblx0Zm9yTmV3UG9zdChwb3N0KSB7XG5cdFx0cmV0dXJuIGdldEFjY291bnQoXCJwb2RpdW0tcG9zdC13aXRoLWNvbnRlbnQtXCIgKyBwb3N0KTtcblx0fVxuXHRcblxuXHQvLyBNZWRpYVxuXHRmb3JNZWRpYShmaWxlKSB7XG5cdFx0cmV0dXJuIGdldEFjY291bnQoSlNPTi5zdHJpbmdpZnkoZmlsZSkpXG5cdH1cblx0Zm9yTWVkaWFGcm9tKGFkZHJlc3MpIHtcblx0XHRyZXR1cm4gZ2V0QWNjb3VudChcInBvZGl1bS1tZWRpYS11cGxvYWRlZC1ieS1cIiArIGFkZHJlc3MpXG5cdH1cblxuXG5cdC8vIEZvbGxvd3Ncblx0Zm9yVXNlcnNGb2xsb3dpbmcoYWRkcmVzcykge1xuXHRcdHJldHVybiBnZXRBY2NvdW50KFwicG9kaXVtLXVzZXItZm9sbG93ZXJzLVwiICsgYWRkcmVzcylcblx0fVxuXHRmb3JVc2Vyc0ZvbGxvd2VkQnkoYWRkcmVzcykge1xuXHRcdHJldHVybiBnZXRBY2NvdW50KFwicG9kaXVtLXVzZXItZm9sbG93aW5nLVwiICsgYWRkcmVzcylcblx0fVxuXHRmb3JSZWxhdGlvbk9mKGFkZHJlc3MxLCBhZGRyZXNzMikge1xuXHRcdHJldHVybiBnZXRBY2NvdW50KFwicG9kaXVtLXVzZXItXCIgKyBhZGRyZXNzMSArXG5cdFx0XHRcdFx0XHQgIFwiLWZvbGxvd3MtdXNlci1cIiArIGFkZHJlc3MyKVxuXHR9XG5cblx0Ly8gQWxlcnRzXG5cdGZvckFsZXJ0c1RvKGFkZHJlc3MpIHtcblx0XHRyZXR1cm4gZ2V0QWNjb3VudChcInBvZGl1bS11c2VyLWFsZXJ0cy1cIiArIGFkZHJlc3MpXG5cdH1cblxufVxuXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9kaXgge1xuXG5cblxuLy8gSU5JVElBTElaQVRJT05cblxuXHRjb25zdHJ1Y3Rvcihjb25maWcgPSBmYWxzZSwgZGVidWcgPSBmYWxzZSkge1xuXG5cdFx0Ly8gU2V0IHVwIGdsb2JhbCB2YXJpYWJsZXNcblx0XHR0aGlzLnVzZXIgPSBudWxsO1xuXHRcdHRoaXMucm91dGUgPSBuZXcgUm91dGVzKCk7XG5cdFx0dGhpcy5jaGFubmVscyA9IE1hcCh7fSk7XG5cdFx0dGhpcy50aW1lcnMgPSBNYXAoe30pO1xuXG5cdFx0Ly8gU2V0IGxvZ2dpbmcgbGV2ZWxcblx0XHR0aGlzLnNldERlYnVnKGRlYnVnKTtcblxuXHRcdC8vIExvYWQgcmVtb3RlIGNvbmZpZyBpZiBub25lIHN1cHBsaWVkXG5cdFx0aWYgKCFjb25maWcpIHtcblx0XHRcdHRoaXMuc2VydmVyID0gXCJodHRwczovL2FwaS5wb2RpdW0tbmV0d29yay5jb21cIjtcblx0XHRcdGZldGNoKHRoaXMuc2VydmVyKVxuXHRcdFx0XHQudGhlbihyZXNwb25zZSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFyZXNwb25zZS5vaykge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IFBvZGl1bUVycm9yKFwiU2VydmVyIE9mZmxpbmVcIilcblx0XHRcdFx0XHRcdFx0LndpdGhDb2RlKDApXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZldGNoKHRoaXMuc2VydmVyICsgXCIvY29uZmlnXCIpXG5cdFx0XHRcdFx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcblx0XHRcdFx0XHRcdFx0LnRoZW4oY29uZmlnID0+IHRoaXMuY29ubmVjdChjb25maWcpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY29ubmVjdChjb25maWcpXG5cdFx0fVxuXG5cdH1cblxuXHRjb25uZWN0KGNvbmZpZykge1xuXHRcdFxuXHRcdC8vIEV4dHJhY3Qgc2V0dGluZ3MgZnJvbSBjb25maWdcblx0XHR0aGlzLmFwcCA9IGNvbmZpZy5BcHBsaWNhdGlvbklEO1xuXHRcdHRoaXMudGltZW91dCA9IGNvbmZpZy5UaW1lb3V0O1xuXHRcdHRoaXMubGlmZXRpbWUgPSBjb25maWcuTGlmZXRpbWU7XG5cdFx0dGhpcy5zZXJ2ZXIgPSBjb25maWcuQVBJO1xuXHRcdHRoaXMubWVkaWEgPSBjb25maWcuTWVkaWFTdG9yZTtcblxuXHRcdC8vIENvbm5lY3QgdG8gcmFkaXggbmV0d29ya1xuXHRcdC8vVE9ETyAtIFRlc3QgcmFkaXggY29ubmVjdGlvblxuXHRcdHN3aXRjaCAoY29uZmlnLlVuaXZlcnNlKSB7XG5cdFx0XHRjYXNlIChcInN1bnN0b25lXCIpOlxuXHRcdFx0XHRyYWRpeFVuaXZlcnNlLmJvb3RzdHJhcChSYWRpeFVuaXZlcnNlLlNVTlNUT05FKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIChcImhpZ2hnYXJkZW5cIik6XG5cdFx0XHRcdHJhZGl4VW5pdmVyc2UuYm9vdHN0cmFwKFJhZGl4VW5pdmVyc2UuSElHSEdBUkRFTik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAoXCJhbHBoYW5ldFwiKTpcblx0XHRcdFx0cmFkaXhVbml2ZXJzZS5ib290c3RyYXAoUmFkaXhVbml2ZXJzZS5BTFBIQU5FVCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBSYWRpeCBVbml2ZXJzZS5cIik7XG5cdFx0fVxuXG5cdH1cblxuXG5cblxuLy8gVVRJTElUSUVTXG5cblx0Z2V0QWNjb3VudChzZWVkKSB7XG5cdFx0cmV0dXJuIGdldEFjY291bnQoc2VlZCk7XG5cdH1cblxuXHRjbGVhblVwKCkgeyBcblx0XHR0aGlzLmNsZWFuVXBUaW1lcnMoKTtcblx0XHR0aGlzLmNsZWFuVXBDaGFubmVscygpO1xuXHR9XG5cblx0c2V0RGVidWcoZGVidWcpIHtcblx0XHR0aGlzLmRlYnVnID0gZGVidWc7XG5cdFx0aWYgKGRlYnVnKSB7XG5cdFx0XHRSYWRpeExvZ2dlci5zZXRMZXZlbCgnZXJyb3InKVxuXHRcdH1cblx0fVxuXG5cblxuXG4vLyBUSU1FUlNcblxuXHRuZXdUaW1lcihcblx0XHRcdGlkLFx0XHRcdC8vIElkZW50aWZpZXIgb2YgdGltZXJcblx0XHRcdGR1cmF0aW9uLFx0Ly8gRHVyYXRpb24gb2YgdGltZXJcblx0XHRcdGNhbGxiYWNrXHQvLyBGdW5jdGlvbiB0byBiZSBjYWxsZWQgdXBvbiB0aW1lciBjb21wbGV0aW9uXG5cdFx0KSB7XG5cblx0XHQvLyBTdGFydCB0aW1lclxuXHRcdGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG5cblx0XHRcdC8vIFJ1biBjYWxsYmFja1xuXHRcdFx0Y2FsbGJhY2soKTtcblxuXHRcdFx0Ly8gRGVsZXRlIHJlY29yZCBvZiB0aGlzIHRpbWVyXG5cdFx0XHR0aGlzLnRpbWVycy5kZWxldGUoaWQpO1xuXG5cdFx0fSwgZHVyYXRpb24pO1xuXG5cdFx0Ly8gU3RvcmUgdGltZXJcblx0XHR0aGlzLnRpbWVycy5pZCA9IHtcblx0XHRcdHRpbWVyOiB0aW1lcixcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFjayxcblx0XHRcdGR1cmF0aW9uOiBkdXJhdGlvblxuXHRcdH1cblxuXHR9XG5cblxuXHRyZXNldFRpbWVyKFxuXHRcdFx0aWQgXHRcdC8vIElkZW50aWZpZXIgb2YgdGltZXIgdG8gYmUgcmVzdGFydGVkXG5cdFx0KSB7XG5cblx0XHQvLyBTdG9wIHRpbWVyXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJzLmlkLnRpbWVyKTtcblxuXHRcdC8vIFJlY3JlYXRlIHRpbWVyXG5cdFx0dGhpcy5uZXdUaW1lcihpZCwgdGhpcy50aW1lcnMuY2FsbGJhY2ssIHRoaXMudGltZXJzLmR1cmF0aW9uKTtcblxuXHR9XG5cblx0c3RvcFRpbWVyKFxuXHRcdFx0aWQgXHRcdC8vIElkZW50aWZpZXIgb2YgdGltZXIgdG8gYmUgc3RvcHBlZFxuXHRcdCkge1xuXG5cdFx0Ly8gU3RvcCB0aW1lclxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVycy5pZC50aW1lcik7XG5cblx0XHQvLyBEZWxldGUgcmVjb3JkIG9mIHRoaXMgdGltZXJcblx0XHR0aGlzLnRpbWVycy5kZWxldGUoXCJpZFwiKTtcblxuXHR9XG5cblx0Y2xlYW5VcFRpbWVycygpIHtcblxuXHRcdC8vIFN0b3BzIGFsbCB0aW1lcnNcblx0XHR0aGlzLnRpbWVycy5tYXAoKHQpID0+IHRoaXMuc3RvcFRpbWVyKHQpKTtcblxuXHR9XG5cblxuXG5cblxuXG4vLyBXUklURSBEQVRBIFRPIFJBRElYXG5cblx0c2VuZFJlY29yZChcblx0XHRcdGFjY291bnRzLFx0XHRcdC8vIERlc3RpbmF0aW9uIGFjY291bnRzIGZvciByZWNvcmQgW0FycmF5XVxuXHRcdFx0cGF5bG9hZCxcdFx0XHQvLyBQYXlsb2FkIG9mIHJlY29yZCB0byBiZSBzZW50IFtPYmplY3R7fV1cblx0XHRcdGlkZW50aXR5ID0gdGhpcy51c2VyLFxuXHRcdFx0ZW5jcnlwdCA9IGZhbHNlXHRcdC8vIEVuY3J5cHQgcmVjb3JkIHdpdGggdXNlcidzIGlkZW50aXR5P1xuXHRcdCkge1xuXHRcdGlmICghaWRlbnRpdHkpIHsgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBJZGVudGl0eVwiKSB9XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGlmIChhY2NvdW50cy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihcIlJlY2VpdmVkIGVtcHR5IGFjY291bnRzIGFycmF5XCIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFJhZGl4VHJhbnNhY3Rpb25CdWlsZGVyXG5cdFx0XHRcdFx0LmNyZWF0ZVBheWxvYWRBdG9tKFxuXHRcdFx0XHRcdFx0YWNjb3VudHMsXG5cdFx0XHRcdFx0XHR0aGlzLmFwcCxcblx0XHRcdFx0XHRcdEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuXHRcdFx0XHRcdFx0ZW5jcnlwdFxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQuc2lnbkFuZFN1Ym1pdChpZGVudGl0eSlcblx0XHRcdFx0XHQuc3Vic2NyaWJlKHtcblx0XHRcdFx0XHRcdGNvbXBsZXRlOiAoKSA9PiByZXNvbHZlKHRydWUpLFxuXHRcdFx0XHRcdFx0bmV4dDogc3RhdHVzID0+IGNvbnNvbGUubG9nKHN0YXR1cyksXG5cdFx0XHRcdFx0XHRlcnJvcjogZXJyb3IgPT4gcmVqZWN0KGVycm9yKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblxuXHRzZW5kUmVjb3JkcygpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG5cdFx0XHQvLyBVbnBhY2sgYXJnIGxpc3Rcblx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuXG5cdFx0XHQvLyBDaGVjayBpZiBpZGVudGl0eSB3YXMgcHJvdmlkZWRcblx0XHRcdGxldCBpZGVudGl0eTtcblx0XHRcdGlmICgoYXJncy5sZW5ndGggJSAyKSA9PT0gMSkge1xuXHRcdFx0XHRpZGVudGl0eSA9IGFyZ3NbMF1cblx0XHRcdFx0YXJncyA9IGFyZ3Muc2xpY2UoMSwgYXJncy5sZW5ndGgpXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMudXNlcikge1xuXHRcdFx0XHRpZGVudGl0eSA9IHRoaXMudXNlclxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBJZGVudGl0eVwiKVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBEaXNwYXRjaCByZWNvcmRzXG5cdFx0XHR0aGlzLnNlbmRSZWNvcmQoYXJnc1swXSwgYXJnc1sxXSwgaWRlbnRpdHkpXG5cdFx0XHRcdC50aGVuKHJlc3VsdCA9PiB7XG5cdFx0XHRcdFx0aWYgKGFyZ3MubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0dGhpcy5zZW5kUmVjb3JkcyhpZGVudGl0eSwgLi4uYXJncy5zbGljZSgyLCBhcmdzLmxlbmd0aCkpXG5cdFx0XHRcdFx0XHRcdC50aGVuKHJlc3VsdCA9PiByZXNvbHZlKHJlc3VsdCkpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlc29sdmUodHJ1ZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXG5cdFx0fSlcblx0fVxuXG5cblxuXG4vLyBGRVRDSCBEQVRBIEZST00gUkFESVhcblxuXHRnZXRIaXN0b3J5KFxuXHRcdFx0YWNjb3VudCxcdFx0XHRcdC8vIEFjY291bnQgdG8gcmV0cmVpdmUgYWxsIHJlY29yZHMgZnJvbVxuXHRcdFx0dGltZW91dCA9IHRoaXMudGltZW91dCBcdC8vIEFzc3VtZSBoaXN0b3J5IGlzIGVtcHR5IGFmdGVyIFggc2Vjb25kcyBpbmFjdGl2aXR5XG5cdFx0KSB7XG5cblx0XHQvLyBQdWxscyBhbGwgY3VycmVudCB2YWx1ZXMgZnJvbSBhIHJhZGl4XG5cdFx0Ly8gLWFjY291bnQtIGFuZCBjbG9zZXMgdGhlIGNoYW5uZWwgY29ubmVjdGlvbi5cblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cblx0XHRcdC8vIE9wZW4gdGhlIGFjY291bnQgY29ubmVjdGlvblxuXHRcdFx0YWNjb3VudC5vcGVuTm9kZUNvbm5lY3Rpb24oKTtcblxuXHRcdFx0Ly8gQ29ubmVjdCB0byBhY2NvdW50IGRhdGFcblx0XHRcdGNvbnN0IHN0cmVhbSA9IGFjY291bnQuZGF0YVN5c3RlbVxuXHRcdFx0XHQuZ2V0QXBwbGljYXRpb25EYXRhKHRoaXMuYXBwKTtcblxuXHRcdFx0Ly8gRmV0Y2ggYWxsIGRhdGEgZnJvbSB0YXJnZXQgY2hhbm5lbFxuXHRcdFx0bGV0IHNraXBwZXI7XG5cdFx0XHR2YXIgaGlzdG9yeSA9IExpc3QoW10pO1xuXHRcdFx0Y29uc3QgY2hhbm5lbCA9IHN0cmVhbS5zdWJzY3JpYmUoe1xuXHRcdFx0XHQvL1RPRE8gLSBSZXdyaXRlIHRvIHB1bGwgdW50aWwgdXAtdG8tZGF0ZSBvbmNlXG5cdFx0XHRcdC8vXHRcdCByYWRpeCBwcm92aWRlcyB0aGUgcmVxdWlyZWQgZmxhZy5cblx0XHRcdFx0Ly9cdFx0IEN1cnJlbnRseSwgdGhpcyBqdXN0IGNvbGxhdGVzIGFsbFxuXHRcdFx0XHQvL1x0XHQgaW5wdXQgdW50aWwgdGltZW91dC5cblx0XHRcdFx0bmV4dDogaXRlbSA9PiB7XG5cdFx0XHRcdFx0aWYgKHNraXBwZXIpIHsgY2xlYXJUaW1lb3V0KHNraXBwZXIpIH1cblx0XHRcdFx0XHR2YXIgcmVjb3JkID0gTWFwKGZyb21KUyhKU09OLnBhcnNlKGl0ZW0uZGF0YS5wYXlsb2FkKSkpXG5cdFx0XHRcdFx0XHQuc2V0KFwicmVjZWl2ZWRcIiwgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcblx0XHRcdFx0XHRcdC5zZXQoXCJjcmVhdGVkXCIsIGl0ZW0uZGF0YS50aW1lc3RhbXApO1xuXHRcdFx0XHRcdGhpc3RvcnkgPSBoaXN0b3J5LnB1c2gocmVjb3JkKTtcblx0XHRcdFx0XHQvLyBBc3N1bWUgYWxsIHJlY29yZHMgY29sbGF0ZWQgMSBzZWNvbmQgYWZ0ZXIgZmlyc3Rcblx0XHRcdFx0XHQvLyAoVGhpcyB3b24ndCB3b3JrIGxvbmctdGVybSwgYnV0IHNlcnZlcyBhcyBhblxuXHRcdFx0XHRcdC8vIGVmZmljaWVudCBmaXggZm9yIHRoZSB0aW1lb3V0IGlzc3VlIHVudGlsIHRoZVxuXHRcdFx0XHRcdC8vIHJhZGl4IGxpYiBjYW4gZmxhZyBhIGNoYW5uZWwgYXMgdXAgdG8gZGF0ZSkuXG5cdFx0XHRcdFx0c2tpcHBlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0Y2hhbm5lbC51bnN1YnNjcmliZSgpXG5cdFx0XHRcdFx0XHRyZXNvbHZlKGhpc3RvcnkpXG5cdFx0XHRcdFx0fSwgMTAwMCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yOiBlcnJvciA9PiB7XG5cdFx0XHRcdFx0Y2hhbm5lbC51bnN1YnNjcmliZSgpO1xuXHRcdFx0XHRcdHJlamVjdChlcnJvcilcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFNldCB0aW1lb3V0XG5cdFx0XHRzZXRUaW1lb3V0KFxuXHRcdFx0XHQoKSA9PiB7XG5cdFx0XHRcdFx0Y2hhbm5lbC51bnN1YnNjcmliZSgpO1xuXHRcdFx0XHRcdGlmIChoaXN0b3J5LnNpemUgPiAwKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKGhpc3RvcnkpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlamVjdChuZXcgUG9kaXVtRXJyb3IoKS53aXRoQ29kZSgyKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRpbWVvdXQgKiAxMDAwXG5cdFx0XHQpXG5cblx0XHR9KTtcblxuXHRcdC8vIFRPRE8gLSBDbG9zZSBub2RlIGNvbm5lY3Rpb25cblxuXHR9XG5cblxuXHRnZXRMYXRlc3QoXG5cdFx0XHRhY2NvdW50LFx0XHRcdFx0Ly8gQWNjb3VudCB0byBxdWVyeSBsYXRlc3QgcmVjb3JkIGZyb21cblx0XHRcdHRpbWVvdXQgPSB0aGlzLnRpbWVvdXQgXHQvLyBBc3N1bWUgYWNjb3VudCBpcyBlbXB0eSBhZnRlciBYIHNlY29uZHMgaW5hY3Rpdml0eVxuXHRcdCkge1xuXG5cdFx0Ly8gUmV0dXJucyB0aGUgbW9zdCByZWNlbnQgcGF5bG9hZCBhbW9uZyBhbGxcblx0XHQvLyBkYXRhIGZvciB0aGUgcHJvdmlkZWQgLWFjY291bnQtLlxuXG5cdFx0Ly8gR2V0IGFjY291bnQgaGlzdG9yeVxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLmdldEhpc3RvcnkoYWNjb3VudCwgdGltZW91dClcblx0XHRcdFx0LnRoZW4oaGlzdG9yeSA9PiByZXNvbHZlKGhpc3Rvcnlcblx0XHRcdFx0XHQuc29ydCgoYSwgYikgPT4gKGEuZ2V0KFwiY3JlYXRlZFwiKSA+IGIuZ2V0KFwiY3JlYXRlZFwiKSkgPyAxIDogLTEpXG5cdFx0XHRcdFx0Lmxhc3QoKVxuXHRcdFx0XHQpKVxuXHRcdFx0XHQuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSk7XG5cdFx0fSk7XG5cblx0fVxuXG5cblxuXG4vLyBTVUJTQ1JJQkUgVE8gUkFESVggREFUQVxuXG5cdG9wZW5DaGFubmVsKFxuXHRcdFx0YWNjb3VudCxcdFx0XHRcdFx0Ly8gUmFkaXggYWNjb3VudCB0byBiZSBxdWVyaWVkXG5cdFx0XHRjYWxsYmFjayxcdFx0XHRcdFx0Ly8gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGZvciBlYWNoIG5ldyByZWNvcmQgb24gY2hhbm5lbFxuXHRcdFx0b25FcnJvciA9IG51bGwsXHRcdFx0XHQvLyBGdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gY2FzZSBvZiBlcnJvclxuXHRcdFx0bGlmZXRpbWUgPSB0aGlzLmxpZmV0aW1lXHQvLyBDbG9zZSBjaGFubmVsIGFmdGVyIFggc2Vjb25kcyBvZiBpbmFjdGl2aXR5XG5cdFx0KSB7XG5cblx0XHQvLyBDcmVhdGVzIGFuZCBtYW5hZ2VzIGEgc3Vic2NyaXB0aW9uIHRvIG5ldyBkYXRhXG5cdFx0Ly8gdXBkYXRlcyBmb3IgYSBnaXZlbiAtYWNjb3VudC0sIHJ1bm5pbmdcblx0XHQvLyAtY2FsbGJhY2stIHdoZW5ldmVyIGEgbmV3IGl0ZW0gaXMgcmVjZWl2ZWQuXG5cdFx0Ly8gV2lsbCBydW4gLW9uRXJyb3ItIGNhbGxiYWNrIGluIGNhc2Ugb2YgZXJyb3IuXG5cdFx0Ly8gV2lsbCB0aW1lb3V0IGFmdGVyIC1saWZldGltZS0gbXMgb2YgaW5hY3Rpdml0eSxcblx0XHQvLyBvciB3aWxsIHJlbWFpbiBvcGVuIGluZGVmaW5pdGVseSBpZiAtbGlmZXRpbWUtXG5cdFx0Ly8gaXMgbm90IHByb3ZpZGVkIG9yIHNldCB0byAwLlxuXG5cdFx0Ly9UT0RPIC0gQ2xvc2UgY2hhbm5lbHMgYWZ0ZXIgYSBwZXJpb2Qgb2YgaW5hY3Rpdml0eVxuXHRcdC8vXHRcdCBhbmQgcmVvcGVuIGF1dG9tYXRpY2FsbHkgb24gcmVzdW1lLlxuXG5cdFx0Ly8gQ2hlY2sgY2hhbm5lbCB0byB0aGlzIGFjY291bnQgaXMgbm90IGFscmVhZHkgb3BlblxuXHRcdGNvbnN0IGFkZHJlc3MgPSBhY2NvdW50LmdldEFkZHJlc3MoKTtcblx0XHRpZiAoYWRkcmVzcyBpbiB0aGlzLmNoYW5uZWxzKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jaGFubmVscy5nZXQoYWRkcmVzcyk7XG5cdFx0fVxuXG5cdFx0Ly8gQ29ubmVjdCB0byB0aGUgYWNjb3VudFxuXHRcdGFjY291bnQub3Blbk5vZGVDb25uZWN0aW9uKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIGRhdGEgcmVxdWVzdFxuXHRcdGNvbnN0IHN0cmVhbSA9IGFjY291bnQuZGF0YVN5c3RlbS5hcHBsaWNhdGlvbkRhdGFTdWJqZWN0O1xuXG5cdFx0Ly8gU2V0IHVwIHRpbWVvdXQsIGlmIHJlcXVpcmVkXG5cdFx0bGV0IHRpbWVyO1xuXHRcdGlmIChsaWZldGltZSA+IDApIHtcblx0XHRcdHRpbWVyID0gdGhpcy5uZXdUaW1lcihhZGRyZXNzLCBsaWZldGltZSwgKGEpID0+IHtcblx0XHRcdFx0dGhpcy5jbG9zZUNoYW5uZWwoYSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBTdWJzY3JpYmUgdG8gZGF0YSBzdHJlYW1cblx0XHRjb25zdCBjaGFubmVsID0gc3RyZWFtLnN1YnNjcmliZSh7XG5cdFx0XHRuZXh0OiBhc3luYyBpdGVtID0+IHtcblxuXHRcdFx0XHQvLyBSZXNldCB0aW1lb3V0XG5cdFx0XHRcdGlmIChsaWZldGltZSA+IDApIHsgdGhpcy5yZXNldFRpbWVyKGFkZHJlc3MpOyB9XG5cblx0XHRcdFx0Ly8gUnVuIGNhbGxiYWNrXG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IE1hcChmcm9tSlMoSlNPTi5wYXJzZShpdGVtLmRhdGEucGF5bG9hZCkpKTtcblx0XHRcdFx0Y2FsbGJhY2socmVzdWx0KTtcblxuXHRcdFx0fSxcblx0XHRcdGVycm9yOiBlcnJvciA9PiB7XG5cblx0XHRcdFx0Ly8gUnVuIGNhbGxiYWNrXG5cdFx0XHRcdGlmICh0eXBlb2Yob25FcnJvcikgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdG9uRXJyb3IoZXJyb3IpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuY2xvc2VDaGFubmVsKGFkZHJlc3MpO1xuXHRcdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIExvZyBvcGVuIGNoYW5uZWxcblx0XHR0aGlzLmNoYW5uZWxzLnNldChcImFkZHJlc3NcIiwgTWFwKHtcblx0XHRcdHRpbWVyOiB0aW1lcixcblx0XHRcdGNoYW5uZWw6IGNoYW5uZWxcblx0XHR9KSlcblxuXHRcdC8vIFJldHVybiB0aGUgY2hhbm5lbFxuXHRcdHJldHVybiBjaGFubmVsO1xuXG5cdH1cblxuXHRjbG9zZUNoYW5uZWwoXG5cdFx0XHRhZGRyZXNzIFx0Ly8gUmFkaXggYWRkcmVzcyBvZiBjaGFubmVsIHRvIGJlIGNsb3NlZFxuXHRcdCkge1xuXG5cdFx0Ly8gQ2xvc2VzIGFuZCBjbGVhbnMgdXAgYSBjaGFubmVsIGNyZWF0ZWQgYnlcblx0XHQvLyBvcGVuQ2hhbm5lbFxuXG5cdFx0Ly8gU3RvcCBjaGFubmVsIHRpbWVvdXRcblx0XHRpZiAoYWRkcmVzcyBpbiB0aGlzLmNoYW5uZWxzKSB7XG5cdFx0XHR0aGlzLnN0b3BUaW1lcih0aGlzLmNoYW5uZWxzLmdldChhZGRyZXNzKS50aW1lcik7XG5cdFx0XHR0aGlzLmNoYW5uZWxzLmdldChhZGRyZXNzKS5jaGFubmVsLnVuc3Vic2NyaWJlKCk7XG5cdFx0XHR0aGlzLmNoYW5uZWxzLmRlbGV0ZShhZGRyZXNzKTtcblx0XHR9XG5cblx0XHQvL1RPRE8gLSBDbG9zZSByYWRpeCBub2RlIGNvbm5lY3Rpb25cblxuXHR9XG5cblx0Y2xlYW5VcENoYW5uZWxzKCkge1xuXG5cdFx0Ly8gQ2xvc2VzIGFsbCBvcGVuIENoYW5uZWxzXG5cdFx0dGhpcy5jaGFubmVscy5tYXAoKGMpID0+IHRoaXMuY2xvc2VDaGFubmVsKGMpKTtcblxuXHR9XG5cblxuXG5cbi8vIE1FRElBXG5cblxuXHR1cGxvYWRNZWRpYShtZWRpYUZpbGUsIGFkZHJlc3MpIHtcblxuXHRcdC8vIERpc3BhdGNoZXMgYSBtZWRpYSBmaWxlIHRvIHRoZSBzZXJ2ZXIsIHdoaWNoXG5cdFx0Ly8gcmV0dXJucyBhbiBJRCBhZGRyZXNzIGZvciB0aGF0IGltYWdlIGluIHRoZVxuXHRcdC8vIHB1YmxpYyBzdG9yZS5cblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRjb25zdCBib2R5ID0gbmV3IEZvcm1EYXRhKClcblx0XHRcdGJvZHkuYXBwZW5kKFwiZmlsZVwiLCBtZWRpYUZpbGUpXG5cdFx0XHRib2R5LmFwcGVuZChcImFkZHJlc3NcIiwgYWRkcmVzcylcblx0XHRcdGZldGNoKGBodHRwczovLyR7dGhpcy5zZXJ2ZXJ9L21lZGlhYCxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRcdFx0Ym9keTogYm9keVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihyZXNwb25zZSA9PiByZXNvbHZlKHJlc3BvbnNlKSlcblx0XHRcdFx0LmNhdGNoKGVycm9yID0+IHJlamVjdChlcnJvcikpXG5cdFx0fSlcblxuXHR9XG5cblxuXHRjcmVhdGVNZWRpYShcblx0XHRcdGZpbGUsXG5cdFx0XHRpZGVudGl0eSA9IHRoaXMudXNlclxuXHRcdCkge1xuXHRcdGlmICghaWRlbnRpdHkpIHsgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBJZGVudGl0eVwiKSB9XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuXHRcdFx0Ly9UT0RPIC0gVmFsaWRhdGUgbWVkaWEgd2l0aCAzcmQgcGFydHkgc2VydmljZVxuXHRcdFx0Ly9cdFx0IHRvIGRldGVjdCBpbWFnZSBtYW5pcHVsYXRpb24sIGV0Yy4uLlxuXG5cdFx0XHQvLyBSZWdpc3RlciBtZWRpYSBvbiBsZWRnZXJcblx0XHRcdGNvbnN0IGFkZHJlc3MgPSBpZGVudGl0eS5hY2NvdW50LmdldEFkZHJlc3MoKTtcblx0XHRcdGNvbnN0IGZpbGVBZGRyZXNzID0gdGhpcy5yb3V0ZS5mb3JNZWRpYShmaWxlKS5nZXRBZGRyZXNzKCkgKyBcIi5cIiArXG5cdFx0XHRcdGZpbGUuc3BsaXQoXCIsXCIpWzBdLnNwbGl0KFwiL1wiKVsxXS5zcGxpdChcIjtcIilbMF07XG5cblx0XHRcdC8vIEdlbmVyYXRlIGZpbGUgcmVjb3JkXG5cdFx0XHQvL1RPRE8gLSBFbnN1cmUgbWVkaWEgYWRkcmVzcyBpcyBpbmRlcGVuZGVudCBvZlxuXHRcdFx0Ly9cdFx0IHRoZSB1cGxvYWRpbmcgdXNlciBzbyB0aGUgc2FtZSBpbWFnZVxuXHRcdFx0Ly9cdFx0IHVwbG9hZGVkIGJ5IGRpZmZlcmVudCB1c2VycyBpcyBzdGlsbFxuXHRcdFx0Ly9cdFx0IG9ubHkgc3RvcmVkIG9uY2Ugb24gUzMuXG5cdFx0XHRjb25zdCBtZWRpYUFjY291bnQgPSB0aGlzLnJvdXRlLmZvck1lZGlhRnJvbShhZGRyZXNzKTtcblx0XHRcdGNvbnN0IG1lZGlhUGF5bG9hZCA9IHtcblx0XHRcdFx0cmVjb3JkOiBcIm1lZGlhXCIsXG5cdFx0XHRcdHR5cGU6IFwiaW1hZ2VcIixcblx0XHRcdFx0YWRkcmVzczogZmlsZUFkZHJlc3Ncblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVnaXN0ZXIgbWVkaWEgb24gbGVkZ2VyXG5cdFx0XHQvL1RPRE8gLSBDaGVjayBpZiBtZWRpYSBhbHJlYWR5IGV4aXN0cyBhbmQgc2tpcFxuXHRcdFx0Ly9cdFx0IHRoaXMgc3RlcCwgaWYgcmVxdWlyZWRcblx0XHRcdHRoaXMuc2VuZFJlY29yZChbbWVkaWFBY2NvdW50XSwgbWVkaWFQYXlsb2FkLCBpZGVudGl0eSlcblx0XHRcdFx0LnRoZW4oKCkgPT4gdGhpcy51cGxvYWRNZWRpYShmaWxlLCBmaWxlQWRkcmVzcykpXG5cdFx0XHRcdC50aGVuKCgpID0+IHJlc29sdmUoZmlsZUFkZHJlc3MpKVxuXHRcdFx0XHQuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSlcblxuXHRcdH0pXG5cdH1cblxuXG5cblxuLy8gVVNFUlNcblxuXHRjcmVhdGVVc2VyKFxuXHRcdGlkLFx0XHRcdC8vIFBvZGl1bSBAIElEIG9mIG5ldyB1c2VyIGFjY291bnRcblx0XHRwdyxcdFx0XHQvLyBQYXNzd29yZCBmb3IgbmV3IHVzZXIgYWNjb3VudFxuXHRcdG5hbWUsXHRcdC8vIERpc3BsYXkgbmFtZSBvZiBuZXcgdXNlciBhY2NvdW50XG5cdFx0YmlvLFx0XHQvLyBCaW8gb2YgbmV3IHVzZXIgYWNjb3VudFxuXHRcdHBpY3R1cmUsXHQvLyBQaWN0dXJlIGFkZHJlc3MgKGluIG1lZGlhIGFyY2hpdmUpIG9mIHVzZXIncyBwcm9maWxlIHBpY3R1cmVcblx0XHQpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0ZmV0Y2goXG5cdFx0XHRcdGBodHRwczovLyR7dGhpcy5zZXJ2ZXJ9L3VzZXJgLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWV0aG9kOiBcIlBPU1RcIixcblx0XHRcdFx0XHRib2R5OiB7XG5cdFx0XHRcdFx0XHRpZDogaWQsXG5cdFx0XHRcdFx0XHRwdzogcHcsXG5cdFx0XHRcdFx0XHRuYW1lOiBuYW1lLFxuXHRcdFx0XHRcdFx0YmlvOiBiaW8sXG5cdFx0XHRcdFx0XHRwaWN0dXJlOiBwaWN0dXJlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQucHJvbWlzZSgpXG5cdFx0XHRcdC50aGVuKHJlc3BvbnNlID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIkNyZWF0ZSBVc2VyIFJlc3BvbnNlXCIsIHJlc3BvbnNlKVxuXHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXHRcdH0pXG5cdH1cblxuXHRuZXdVc2VyKFxuXHRcdFx0aWQsXHRcdFx0Ly8gUG9kaXVtIEAgSUQgb2YgbmV3IHVzZXIgYWNjb3VudFxuXHRcdFx0cHcsXHRcdFx0Ly8gUGFzc3dvcmQgZm9yIG5ldyB1c2VyIGFjY291bnRcblx0XHRcdG5hbWUsXHRcdC8vIERpc3BsYXkgbmFtZSBvZiBuZXcgdXNlciBhY2NvdW50XG5cdFx0XHRiaW8sXHRcdC8vIEJpbyBvZiBuZXcgdXNlciBhY2NvdW50XG5cdFx0XHRwaWN0dXJlLFx0Ly8gUGljdHVyZSBhZGRyZXNzIChpbiBtZWRpYSBhcmNoaXZlKSBvZiB1c2VyJ3MgcHJvZmlsZSBwaWN0dXJlXG5cdFx0XHRzZXRVc2VyPWZhbHNlXG5cdFx0KSB7XG5cblx0XHQvLyBSZWdpc3RlcnMgYSBuZXcgcG9kaXVtIHVzZXIuXG5cblx0XHQvLyBQb2RpdW0gdXNlcnMgYXJlIHJlcHJlc2VudGVkIG9uIHRoZSBsZWRnZXIgYnkgNiByZWNvcmRzXG5cdFx0Ly9cdDEpIFByb2ZpbGUgUmVjb3JkIC0gc3RvcmVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSB1c2VyLFxuXHRcdC8vXHRcdFx0aW5jbHVkaW5nIHRoZWlyIGRpc3BsYXkgbmFtZSBhbmQgYmlvXG5cdFx0Ly9cdDIpIFBPRCBSZWNvcmQgLSBzdG9yZXMgdHJhbnNhY3Rpb25zIG9mIFBvZGl1bSBUb2tlbnNcblx0XHQvL1x0XHRcdGJ5IHRoZSB1c2VyLCB3aGljaCBjYW4gYmUgY29tcGlsZWQgdG8gY2FsY3VsYXRlXG5cdFx0Ly9cdFx0XHR0aGUgdXNlcidzIGN1cnJlbnQgUE9EIGJhbGFuY2Vcblx0XHQvL1x0MykgQVVEIFJlY29yZCAtIHN0b3JlcyB0cmFuc2FjdGlvbnMgb2YgQXVkaXVtIFRva2Vuc1xuXHRcdC8vXHRcdFx0YnkgdGhlIHVzZXIsIHdoaWNoIGNhbiBiZSBjb21waWxlZCB0byBjYWxjdWxhdGVcblx0XHQvL1x0XHRcdHRoZSB1c2VyJ3MgY3VycmVudCBBVUQgYmFsYW5jZVxuXHRcdC8vXHQ0KSBJbnRlZ3JpdHkgUmVjb3JkIC0gc3RvcmVzIGdhaW5zL2xvc3NlcyBvZiBJbnRlZ3JpdHlcblx0XHQvL1x0XHRcdGZvciB0aGlzIHVzZXIsIHdoaWNoIGNhbiBiZSBjb21waWxlZCB0byBjYWxjdWxhdGVcblx0XHQvL1x0XHRcdHRoZSB1c2VyJ3MgY3VycmVudCBJbnRlZ3JpdHlcblx0XHQvL1x0NSkgUGVybWlzc2lvbnMgLSBzdG9yZXMgcmVjb3JkcyBkaWN0YXRpbmcgdGhlIHVzZXInc1xuXHRcdC8vXHRcdFx0Y3VycmVudCBwZXJtaXNzaW9ucyBvbiBQb2RpdW1cblx0XHQvL1x0NikgSUQgT3duZXJzaGlwIFJlY29yZCAtIHN0b3JlcyBhIHJlZmVyZW5jZSBmb3IgdGhlIHVzZXInc1xuXHRcdC8vXHRcdFx0YWRkcmVzcyB0byB0aGVpciBQb2RpdW0gQCBJRC4gVXNlZCB0byBjb25maXJtXG5cdFx0Ly9cdFx0XHRhY2NvdW50IG93bmVyc2hpcCwgdHJhY2sgYWNjb3VudCBoaXN0b3J5LCBhbmQgdG9cblx0XHQvL1x0XHRcdHBlcm1pdCB1c2VycyB0byBmcmVlbHkgdHJhbnNmZXIgdGhlaXIgSURzXG5cblx0XHQvL1RPRE8gLSBSZXF1aXJlIElEIGFuZCBwdyB0byBvYmV5IGNlcnRhaW4gcnVsZXNldHNcblxuXHRcdC8vVE9ETyAtIFJlcGxhY2Ugd2l0aCBzY3J5cHRvIHNtYXJ0IGNvbnRyYWN0XG5cblx0XHQvLyBDcmVhdGUgb3V0cHV0IHByb21pc2Vcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG5cdFx0XHQvLyBDcmVhdGUgdXNlciBpZGVudGl0eVxuXHRcdFx0Y29uc3QgaWRlbnRpdHlNYW5hZ2VyID0gbmV3IFJhZGl4SWRlbnRpdHlNYW5hZ2VyKCk7XG5cdFx0XHRjb25zdCBpZGVudGl0eSA9IGlkZW50aXR5TWFuYWdlci5nZW5lcmF0ZVNpbXBsZUlkZW50aXR5KCk7XG5cdFx0XHRjb25zdCBhZGRyZXNzID0gaWRlbnRpdHkuYWNjb3VudC5nZXRBZGRyZXNzKCk7XG5cblx0XHRcdC8vVE9ETyAtIFN0b3JlIHBpY3R1cmUsIGlmIHByZXNlbnRcblx0XHRcdGxldCBwaWN0dXJlQWRkcmVzcztcblx0XHRcdGlmIChwaWN0dXJlKSB7XG5cdFx0XHRcdHBpY3R1cmVBZGRyZXNzID0gYXdhaXQgdGhpcy5jcmVhdGVNZWRpYShwaWN0dXJlLCBpZGVudGl0eSlcblx0XHRcdH1cblxuXHRcdFx0Ly8gR2VuZXJhdGUgdXNlciBwdWJsaWMgcmVjb3JkXG5cdFx0XHRjb25zdCBwcm9maWxlQWNjb3VudCA9IHRoaXMucm91dGUuZm9yUHJvZmlsZU9mKGFkZHJlc3MpO1xuXHRcdFx0Y29uc3QgcHJvZmlsZVBheWxvYWQgPSB7XG5cdFx0XHRcdHJlY29yZDogXCJ1c2VyXCIsXG5cdFx0XHRcdHR5cGU6IFwicHJvZmlsZVwiLFxuXHRcdFx0XHRpZDogaWQsXG5cdFx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRcdGJpbzogYmlvLFxuXHRcdFx0XHRwaWN0dXJlOiBwaWN0dXJlQWRkcmVzcyxcblx0XHRcdFx0YWRkcmVzczogYWRkcmVzc1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBHZW5lcmF0ZSB1c2VyIFBPRCBhY2NvdW50XG5cdFx0XHRjb25zdCBwb2RBY2NvdW50ID0gdGhpcy5yb3V0ZS5mb3JQT0RvZihhZGRyZXNzKTtcblx0XHRcdGNvbnN0IHBvZFBheWxvYWQgPSB7XG5cdFx0XHRcdG93bmVyOiBhZGRyZXNzLFxuXHRcdFx0XHRwb2Q6IDUwMCxcblx0XHRcdFx0ZnJvbTogXCJcIlxuXHRcdFx0fVxuXG5cdFx0XHQvLyBHZW5lcmF0ZSB1c2VyIEFVRCBhY2NvdW50XG5cdFx0XHRjb25zdCBhdWRBY2NvdW50ID0gdGhpcy5yb3V0ZS5mb3JBVURvZihhZGRyZXNzKTtcblx0XHRcdGNvbnN0IGF1ZFBheWxvYWQgPSB7XG5cdFx0XHRcdG93bmVyOiBhZGRyZXNzLFxuXHRcdFx0XHRwb2Q6IDEwLFxuXHRcdFx0XHRmcm9tOiBcIlwiXG5cdFx0XHR9XG5cblx0XHRcdC8vIEdlbmVyYXRlIHVzZXIgaW50ZWdyaXR5IHJlY29yZFxuXHRcdFx0Y29uc3QgaW50ZWdyaXR5QWNjb3VudCA9IHRoaXMucm91dGUuZm9ySW50ZWdyaXR5T2YoYWRkcmVzcyk7XG5cdFx0XHRjb25zdCBpbnRlZ3JpdHlQYXlsb2FkID0ge1xuXHRcdFx0XHRvd25lcjogYWRkcmVzcyxcblx0XHRcdFx0aTogMC41LFxuXHRcdFx0XHRmcm9tOiBcIlwiXG5cdFx0XHR9XG5cblx0XHRcdC8vIEdlbmVyYXRlIHJlY29yZCBvZiB0aGlzIHVzZXIncyBhZGRyZXNzIG93bmluZyB0aGlzIElEXG5cdFx0XHRjb25zdCBvd25lcnNoaXBBY2NvdW50ID0gdGhpcy5yb3V0ZS5mb3JQcm9maWxlV2l0aElEKGlkKTtcblx0XHRcdGNvbnN0IG93bmVyc2hpcFBheWxvYWQgPSB7XG5cdFx0XHRcdGlkOiBpZCxcblx0XHRcdFx0b3duZXI6IGFkZHJlc3Ncblx0XHRcdH07XG5cblx0XHRcdC8vIEVuY3J5cHQga2V5cGFpclxuXHRcdFx0Y29uc3Qga2V5U3RvcmUgPSB0aGlzLnJvdXRlLmZvcktleXN0b3JlT2YoaWQsIHB3KTtcblx0XHRcdFJhZGl4S2V5U3RvcmUuZW5jcnlwdEtleShpZGVudGl0eS5rZXlQYWlyLCBwdylcblx0XHRcdFx0LnRoZW4oYXN5bmMgZW5jcnlwdGVkS2V5ID0+IHtcblxuXHRcdFx0XHRcdC8vIFN0b3JlIHJlZ2lzdHJhdGlvbiByZWNvcmRzXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2VuZFJlY29yZHMoXG5cdFx0XHRcdFx0XHRpZGVudGl0eSxcblx0XHRcdFx0XHRcdFtrZXlTdG9yZV0sIGVuY3J5cHRlZEtleSxcblx0XHRcdFx0XHRcdFtwcm9maWxlQWNjb3VudF0sIHByb2ZpbGVQYXlsb2FkLFxuXHRcdFx0XHRcdFx0W3BvZEFjY291bnRdLCBwb2RQYXlsb2FkLFxuXHRcdFx0XHRcdFx0W2F1ZEFjY291bnRdLCBhdWRQYXlsb2FkLFxuXHRcdFx0XHRcdFx0W2ludGVncml0eUFjY291bnRdLCBpbnRlZ3JpdHlQYXlsb2FkLFxuXHRcdFx0XHRcdFx0W293bmVyc2hpcEFjY291bnRdLCBvd25lcnNoaXBQYXlsb2FkXG5cdFx0XHRcdFx0KVxuXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC8vVE9ETyAtIEFkZCB0aGlzIHVzZXIgdG8gdGhlIGluZGV4IGRhdGFiYXNlXG5cdFx0XHRcdC8vVE9ETyAtIEF1dG8tZm9sbG93IFBvZGl1bSBtYXN0ZXIgYWNjb3VudFxuXHRcdFx0XHQudGhlbihyZXN1bHQgPT4ge1xuXHRcdFx0XHRcdGlmIChzZXRVc2VyKSB7IHRoaXMudXNlciA9IGlkZW50aXR5IH1cblx0XHRcdFx0XHRyZXNvbHZlKGFkZHJlc3MpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXG5cdFx0fSk7XG5cblx0fVxuXG5cblx0c2V0VXNlcihcblx0XHRcdGlkLFx0XHQvLyBVc2VyIElkZW50aWZpZXJcblx0XHRcdHB3IFx0XHQvLyBVc2VyIHBhc3N3b3JkXG5cdFx0KSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMuZ2V0TGF0ZXN0KHRoaXMucm91dGUuZm9yS2V5c3RvcmVPZihpZCwgcHcpKVxuXHRcdFx0XHQudGhlbihlbmNyeXB0ZWRLZXkgPT4gUmFkaXhLZXlTdG9yZVxuXHRcdFx0XHRcdC5kZWNyeXB0S2V5KGVuY3J5cHRlZEtleS50b0pTKCksIHB3KSlcblx0XHRcdFx0LnRoZW4oa2V5UGFpciA9PiB7XG5cdFx0XHRcdFx0dGhpcy51c2VyID0gbmV3IFJhZGl4U2ltcGxlSWRlbnRpdHkoa2V5UGFpcik7XG5cdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGVycm9yID0+IHJlamVjdChlcnJvcikpXG5cdFx0fSlcblx0fVxuXG5cblx0dXBkYXRlVXNlcklkZW50aWZpZXIoKSB7fVxuXG5cblx0c3dhcFVzZXJJZGVudGlmaWVycygpIHt9XG5cblxuXG5cblxuLy8gVVNFUiBQUk9GSUxFU1xuXG5cdHVwZGF0ZVVzZXJEaXNwbGF5TmFtZSgpIHt9XG5cblx0dXBkYXRlVXNlckJpbygpIHt9XG5cblx0dXBkYXRlVXNlclBpY3R1cmUoKSB7fVxuXG5cblx0Ly9UT0RPIC0gaGFuZGxlIG11bHRpcGxlIHNpbXVsdGFuZW91cyByZXF1ZXN0c1xuXHQvL1x0XHQgZm9yIHRoZSBzYW1lIHJlY29yZCB3aXRob3V0IG11bHRpcGxlXG5cdC8vXHRcdCBjYWxscyB0byB0aGUgbmV0d29ya1xuXG5cdGZldGNoUHJvZmlsZShcblx0XHRcdHRhcmdldCxcdFx0Ly8gVGhlIGFkZHJlc3MgKG9yIElEKSBvZiB0aGUgcHJvZmlsZSB0byBiZSByZXRyZWl2ZWRcblx0XHRcdGlkID0gZmFsc2UgXHQvLyBTZXQgdHJ1ZSBpZiBwYXNzaW5nIGFuIElEIGluc3RlYWQgb2YgYW4gYWRkcmVzc1xuXHRcdCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRcblx0XHRcdC8vIFNlYXJjaCBvbiBJRCBvciBBZGRyZXNzXG5cdFx0XHRpZiAoaWQpIHtcblxuXHRcdFx0XHQvLyBTZWFyY2ggb24gSURcblx0XHRcdFx0dGhpcy5nZXRMYXRlc3QodGhpcy5yb3V0ZS5mb3JQcm9maWxlV2l0aElEKHRhcmdldCkpXG5cdFx0XHRcdFx0LnRoZW4ocmVmZXJlbmNlID0+IHJlc29sdmUoXG5cdFx0XHRcdFx0XHR0aGlzLmZldGNoUHJvZmlsZShyZWZlcmVuY2UuZ2V0KFwiYWRkcmVzc1wiKSlcblx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFNlYXJjaCBvbiBhZGRyZXNzXG5cdFx0XHRcdHRoaXMuZ2V0TGF0ZXN0KHRoaXMucm91dGUuZm9yUHJvZmlsZU9mKHRhcmdldCkpXG5cdFx0XHRcdFx0LnRoZW4ocmVzdWx0ID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHByb2ZpbGUgPSByZXN1bHQudXBkYXRlKFxuXHRcdFx0XHRcdFx0XHRcInBpY3R1cmVcIixcblx0XHRcdFx0XHRcdFx0KHApID0+IGBodHRwczovLyR7dGhpcy5tZWRpYX0vJHtwfWBcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdHJlc29sdmUocHJvZmlsZSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXG5cdFx0XHR9XG5cblx0XHR9KVxuXHR9XG5cblxuXG5cbi8vIFRPUElDU1xuXG5cdGNyZWF0ZVRvcGljKFxuXHRcdFx0aWQsXHRcdFx0XHQvLyBVbmlxdWUgaWRlbnRpZmllciBmb3IgdG9waWNcblx0XHRcdG5hbWUsXHRcdFx0Ly8gRGlzcGxheSBuYW1lIG9mIHRvcGljXG5cdFx0XHRkZXNjcmlwdGlvbixcdC8vIERlc2NyaXB0aW9uIG9mIHRvcGljXG5cdFx0XHRvd25lcixcdFx0XHQvLyBBZGRyZXNzIG9mIGNyZWF0aW5nIHVzZXJcblx0XHRcdGlkZW50aXR5ID0gdGhpcy51c2VyXG5cdFx0KSB7XG5cdFx0aWYgKCFpZGVudGl0eSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIElkZW50aXR5XCIpIH1cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG5cdFx0XHQvLyBSZXNvbHZlIHRvcGljIGFkZHJlc3Ncblx0XHRcdGNvbnN0IHRvcGljQWNjb3VudCA9IHRoaXMucm91dGUuZm9yVG9waWNXaXRoSUQoaWQpO1xuXHRcdFx0Y29uc3QgdG9waWNBZGRyZXNzID0gdG9waWNBY2NvdW50LmdldEFkZHJlc3MoKTtcblxuXHRcdFx0Ly8gQnVpbGQgdG9waWMgcmVjb3JkXG5cdFx0XHRjb25zdCB0b3BpY1JlY29yZCA9IHtcblx0XHRcdFx0cmVjb3JkOiBcInRvcGljXCIsXG5cdFx0XHRcdHR5cGU6IFwidG9waWNcIixcblx0XHRcdFx0aWQ6IGlkLFxuXHRcdFx0XHRuYW1lOiBuYW1lLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG5cdFx0XHRcdG93bmVyOiBvd25lcixcblx0XHRcdFx0YWRkcmVzczogdG9waWNBZGRyZXNzXG5cdFx0XHR9XG5cblx0XHRcdC8vIFN0b3JlIHRvcGljXG5cdFx0XHR0aGlzLnNlbmRSZWNvcmQoW3RvcGljQWNjb3VudF0sIHRvcGljUmVjb3JkLCBpZGVudGl0eSlcblx0XHRcdFx0Ly9UT0RPIC0gQWRkIHRvcGljIHRvIGluZGV4IGRhdGFiYXNlXG5cdFx0XHRcdC50aGVuKHJlc3VsdCA9PiByZXNvbHZlKGZyb21KUyh0b3BpY1JlY29yZCkpKVxuXHRcdFx0XHQuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSlcblxuXHRcdH0pXG5cdH1cblxuXG5cdGZldGNoVG9waWMoXG5cdFx0XHR0YXJnZXQsXHRcdC8vIFRoZSBhZGRyZXNzIChvciBJRCkgb2YgdGhlIHRvcGljIHRvIGJlIHJldHJlaXZlZFxuXHRcdFx0aWQgPSBmYWxzZVx0Ly8gU2V0IHRydWUgaWYgcGFzc2luZyBhbiBJRCBpbnN0ZWFkIG9mIGFuIGFkZHJlc3Ncblx0XHQpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XG5cdFx0XHQvLyBTZWFyY2ggb24gSUQgb3IgQWRkcmVzc1xuXHRcdFx0aWYgKGlkKSB7XG5cblx0XHRcdFx0Ly8gU2VhcmNoIG9uIElEXG5cdFx0XHRcdHRoaXMuZ2V0TGF0ZXN0KHRoaXMucm91dGUuZm9yVG9waWNXaXRoSUQodGFyZ2V0KSlcblx0XHRcdFx0XHQudGhlbihyZWZlcmVuY2UgPT4gcmVzb2x2ZShcblx0XHRcdFx0XHRcdHRoaXMuZmV0Y2hUb3BpYyhyZWZlcmVuY2UuZ2V0KFwiYWRkcmVzc1wiKSlcblx0XHRcdFx0XHQpKVxuXHRcdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFNlYXJjaCBvbiBhZGRyZXNzXG5cdFx0XHRcdHRoaXMuZ2V0TGF0ZXN0KHRoaXMucm91dGUuZm9yVG9waWModGFyZ2V0KSlcblx0XHRcdFx0XHQudGhlbih0b3BpYyA9PiByZXNvbHZlKHRvcGljKSlcblx0XHRcdFx0XHQuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSlcblxuXHRcdFx0fVxuXG5cdFx0fSlcblx0fVxuXG5cblxuXG5cbi8vIFBPU1RTXG5cblx0Y3JlYXRlUG9zdChcblx0XHRcdGNvbnRlbnQsXHRcdFx0Ly8gQ29udGVudCBvZiBuZXcgcG9zdFxuXHRcdFx0cmVmZXJlbmNlcyA9IFtdLFx0Ly8gUmVmZXJlbmNlcyBjb250YWluZWQgaW4gbmV3IHBvc3Rcblx0XHRcdHBhcmVudCA9IG51bGwsXHRcdC8vIFJlY29yZCBvZiBwb3N0IGJlaW5nIHJlcGxpZWQgdG8gKGlmIGFueSlcblx0XHRcdGlkZW50aXR5ID0gdGhpcy51c2VyXG5cdFx0KSB7XG5cdFx0aWYgKCFpZGVudGl0eSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIElkZW50aXR5XCIpIH1cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG5cdFx0XHQvLyBHZXQgdXNlciBkYXRhXG5cdFx0XHRjb25zdCB1c2VyQWRkcmVzcyA9IGlkZW50aXR5LmFjY291bnQuZ2V0QWRkcmVzcygpO1xuXG5cdFx0XHQvLyBCdWlsZCBwb3N0IGFjY291bnRzXG5cdFx0XHQvL1RPRE8gLSBGaXggZGV0ZXJtaW5pc3RpYyBwb3N0aW5nIGFkZHJlc3Nlc1xuXHRcdFx0Ly9jb25zdCBwb3N0QWNjb3VudCA9IHRoaXMucm91dGUuZm9yTmV4dFBvc3RCeSh0aGlzLnN0YXRlLmRhdGEuZ2V0KFwidXNlclwiKSk7XG5cdFx0XHRjb25zdCBwb3N0QWNjb3VudCA9IHRoaXMucm91dGUuZm9yTmV3UG9zdChjb250ZW50KTtcblx0XHRcdGNvbnN0IHBvc3RBZGRyZXNzID0gcG9zdEFjY291bnQuZ2V0QWRkcmVzcygpO1xuXG5cdFx0XHQvLyBCdWlsZCBwb3N0IHJlY29yZFxuXHRcdFx0Y29uc3QgcG9zdFJlY29yZCA9IHtcblx0XHRcdFx0cmVjb3JkOiBcInBvc3RcIixcdFx0Ly8gb3JpZ2luLCBhbWVuZG1lbnQsIHJldHJhY3Rpb25cblx0XHRcdFx0dHlwZTogXCJwb3N0XCIsXG5cdFx0XHRcdGNvbnRlbnQ6IGNvbnRlbnQsXG5cdFx0XHRcdGFkZHJlc3M6IHBvc3RBZGRyZXNzLFxuXHRcdFx0XHRhdXRob3I6IHVzZXJBZGRyZXNzLFxuXHRcdFx0XHRwYXJlbnQ6IChwYXJlbnQpID8gcGFyZW50LmdldChcImFkZHJlc3NcIikgOiBudWxsLFx0XHRcdFxuXHRcdFx0XHRvcmlnaW46IChwYXJlbnQpID8gcGFyZW50LmdldChcIm9yaWdpblwiKSA6IHBvc3RBZGRyZXNzLFxuXHRcdFx0XHRkZXB0aDogKHBhcmVudCkgPyBwYXJlbnQuZ2V0KFwiZGVwdGhcIikgKyAxIDogMFxuXHRcdFx0fVxuXG5cdFx0XHQvLyBCdWlsZCByZWZlcmVuY2UgcGF5bG9hZCBhbmQgZGVzdGluYXRpb24gYWNjb3VudHNcblx0XHRcdGNvbnN0IHJlZkFjY291bnRzID0gW1xuXHRcdFx0XHR0aGlzLnJvdXRlLmZvclBvc3RzQnkodXNlckFkZHJlc3MpXG5cdFx0XHRcdC8vVE9ETyAtIEFkZCB0byBvdGhlciBpbmRleGVzIGZvciB0b3BpY3MsIG1lbnRpb25zLCBsaW5rc1xuXHRcdFx0XTtcblx0XHRcdGNvbnN0IHJlZlJlY29yZCA9IHtcblx0XHRcdFx0cmVjb3JkOiBcInBvc3RcIixcblx0XHRcdFx0dHlwZTogXCJyZWZlcmVuY2VcIixcblx0XHRcdFx0YWRkcmVzczogcG9zdEFkZHJlc3Ncblx0XHRcdH1cblxuXHRcdFx0Ly8gQnVpbGQgYWxlcnQgcGF5bG9hZFxuXHRcdFx0Ly9UT0RPIC0gYnVpbGQgYWxlcnRzIHN5c3RlbVxuXHRcdFx0Ly8gY29uc3QgYWxlcnRBY2NvdW50cyA9IFtdXG5cdFx0XHQvLyBjb25zdCBhbGVydFJlY29yZCA9IHtcblx0XHRcdC8vIFx0cmVjb3JkOiBcImFsZXJ0XCIsXG5cdFx0XHQvLyBcdHR5cGU6IFwibWVudGlvblwiLFxuXHRcdFx0Ly8gXHRhZGRyZXNzOiBwb3N0QWRkcmVzcyxcblx0XHRcdC8vIFx0Ynk6IHVzZXJBZGRyZXNzXG5cdFx0XHQvLyBcdGNyZWF0ZWQ6IHRpbWVcblx0XHRcdC8vIH1cblxuXHRcdFx0Ly8gU3RvcmUgcmVjb3JkcyBpbiBsZWRnZXJcblx0XHRcdHRoaXMuc2VuZFJlY29yZHMoXG5cdFx0XHRcdFx0aWRlbnRpdHksXG5cdFx0XHRcdFx0W3Bvc3RBY2NvdW50XSwgcG9zdFJlY29yZCxcblx0XHRcdFx0XHRyZWZBY2NvdW50cywgcmVmUmVjb3JkXG5cdFx0XHRcdClcblx0XHRcdFx0LnRoZW4ocmVzdWx0ID0+IHJlc29sdmUoZnJvbUpTKHBvc3RSZWNvcmQpKSlcblx0XHRcdFx0LmNhdGNoKGVycm9yID0+IHJlamVjdChlcnJvcikpXG5cblx0XHR9KTtcblxuXHR9XG5cblxuXHRmZXRjaFBvc3QoYWRkcmVzcykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLmdldEhpc3RvcnkodGhpcy5yb3V0ZS5mb3JQb3N0KGFkZHJlc3MpKVxuXHRcdFx0XHQudGhlbihwb3N0SGlzdG9yeSA9PiByZXNvbHZlKFxuXHRcdFx0XHRcdHBvc3RIaXN0b3J5LnJlZHVjZShcblx0XHRcdFx0XHRcdChwLCBueHQpID0+IHtcblx0XHRcdFx0XHRcdFx0Ly8gVE9ETyAtIE1lcmdlIGVkaXRzIGFuZCByZXRyYWN0aW9uc1xuXHRcdFx0XHRcdFx0XHQvL1x0XHQgIGludG8gYSBzaW5nbGUgY29oZXNpdmUgbWFwXG5cdFx0XHRcdFx0XHRcdHJldHVybiBwLm1lcmdlRGVlcChueHQpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdE1hcCh7fSlcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCkpXG5cdFx0XHRcdC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKVxuXHRcdH0pXG5cdH1cblxuXG5cdGxpc3RlblBvc3RzKGFkZHJlc3MsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5vcGVuQ2hhbm5lbChcblx0XHRcdHRoaXMucm91dGUuZm9yUG9zdHNCeShhZGRyZXNzKSxcblx0XHRcdGNhbGxiYWNrXG5cdFx0KTtcblx0fVxuXG5cblx0cHJvbW90ZVBvc3QoXG5cdFx0XHRhZGRyZXNzLCBcdC8vIFJhZGl4IGFkZHJlc3Mgb2YgcG9zdCB0byBiZSBwcm9tb3RlZFxuXHRcdFx0cHJvbW90ZXIsXHQvLyBSYWRpeCBhZGRyZXNzIG9mIHVzZXIgcHJvbW90aW5nIHNhaWQgcG9zdFxuXHRcdFx0cG9kLFx0XHQvLyBQb2RpdW0gc3BlbnQgcHJvbW90aW5nIHRoZSBwb3N0XG5cdFx0XHRhdWQgPSAwXHRcdC8vIEF1ZGl1bSBzcGVudCBwcm9tb3RpbmcgdGhlIHBvc3Rcblx0XHQpIHtcblx0XHRjb25zb2xlLmxvZyhcIlBST01PVEVEIFBPU1QgXCIsIGFkZHJlc3MpO1xuXHR9XG5cblxuXHRyZXBvcnRQb3N0KCkge31cblxuXG5cdGFtZW5kUG9zdCgpIHt9XG5cblxuXHRyZXRyYWN0UG9zdCgpIHt9XG5cblxuXG5cblxuLy8gQUxFUlRTXG5cblx0bGlzdGVuQWxlcnRzKGFkZHJlc3MsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5vcGVuQ2hhbm5lbChcblx0XHRcdHRoaXMucm91dGUuZm9yQWxlcnRzVG8oYWRkcmVzcyksXG5cdFx0XHRjYWxsYmFja1xuXHRcdCk7XG5cdH1cblxuXG5cblxuLy8gRk9MTE9XSU5HXG5cblx0bGlzdGVuRm9sbG93KGFkZHJlc3MsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5vcGVuQ2hhbm5lbChcblx0XHRcdHRoaXMucm91dGUuZm9yVXNlcnNGb2xsb3dlZEJ5KGFkZHJlc3MpLFxuXHRcdFx0Y2FsbGJhY2tcblx0XHQpO1xuXHR9XG5cblxuXHRmb2xsb3dVc2VyKFxuXHRcdFx0Zm9sbG93QWRkcmVzcyxcdC8vIEFkZHJlc3Mgb2YgdXNlciBub3cgYmVpbmcgZm9sbG93ZWQgYnkgYWN0aXZlIHVzZXJcblx0XHRcdGlkZW50aXR5PXRoaXMudXNlclxuXHRcdCkge1xuXHRcdGlmIChpZGVudGl0eSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIElkZW50aXR5XCIpIH1cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG5cdFx0XHQvLyBHZXQgdXNlciBkYXRhXG5cdFx0XHRjb25zdCB1c2VyQWRkcmVzcyA9IGlkZW50aXR5LmFjY291bnQuZ2V0QWRkcmVzcygpO1xuXG5cdFx0XHQvLyBCdWlsZCBmb2xsb3cgYWNjb3VudCBwYXlsb2FkXG5cdFx0XHRjb25zdCBmb2xsb3dBY2NvdW50ID0gdGhpcy5yb3V0ZS5mb3JGb2xsb3dpbmcodXNlckFkZHJlc3MpO1xuXHRcdFx0Y29uc3QgZm9sbG93UmVjb3JkID0ge1xuXHRcdFx0XHR0eXBlOiBcImZvbGxvd2VyIGluZGV4XCIsXG5cdFx0XHRcdGFkZHJlc3M6IHVzZXJBZGRyZXNzLFxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQnVpbGQgcmVsYXRpb24gYWNjb3VudCBhbmQgcGF5bG9hZFxuXHRcdFx0Y29uc3QgcmVsYXRpb25BY2NvdW50ID0gdGhpcy5yb3V0ZS5mb3JSZWxhdGlvbk9mKHVzZXJBZGRyZXNzLCBmb2xsb3dBZGRyZXNzKTtcblx0XHRcdGNvbnN0IHJlbGF0aW9uUmVjb3JkID0ge1xuXHRcdFx0XHR0eXBlOiBcImZvbGxvd2VyIHJlY29yZFwiLFxuXHRcdFx0XHR1c2VyczogW3VzZXJBZGRyZXNzLCBmb2xsb3dBZGRyZXNzXSxcblx0XHRcdFx0Zm9sbG93OiB0cnVlLFxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQnVpbGQgZm9sbG93aW5nIHBheWxvYWRcblx0XHRcdGNvbnN0IGZvbGxvd2luZ0FjY291bnQgPSB0aGlzLnJvdXRlLmZvckZvbGxvd3NCeSh1c2VyQWRkcmVzcyk7XG5cdFx0XHRjb25zdCBmb2xsb3dpbmdSZWNvcmQgPSB7XG5cdFx0XHRcdHR5cGU6IFwiZm9sbG93aW5nIGluZGV4XCIsXG5cdFx0XHRcdGFkZHJlc3M6IGZvbGxvd0FkZHJlc3MsXG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBTdG9yZSBmb2xsb3dpbmcgcmVjb3JkXG5cdFx0XHR0aGlzLnNlbmRSZWNvcmRzKFxuXHRcdFx0XHRcdGlkZW50aXR5LFxuXHRcdFx0XHRcdFtmb2xsb3dBY2NvdW50XSwgZm9sbG93UmVjb3JkLFxuXHRcdFx0XHRcdFtyZWxhdGlvbkFjY291bnRdLCByZWxhdGlvblJlY29yZCxcblx0XHRcdFx0XHRbZm9sbG93aW5nQWNjb3VudF0sIGZvbGxvd2luZ1JlY29yZFxuXHRcdFx0XHQpXG5cdFx0XHRcdC8vVE9ETyAtIEFsZXJ0cyBzeXN0ZW1cblx0XHRcdFx0LnRoZW4oKHJlc3VsdCkgPT4gcmVzb2x2ZShyZXN1bHQpKVxuXHRcdFx0XHQuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSlcblxuXHRcdH0pXG5cblx0fVxuXG5cblx0dW5mb2xsb3dVc2VyKCkge31cblxuXG59XG5cbiJdfQ==