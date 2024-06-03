import { FullEventCallback, MDSObj, ErrorMsg } from "./types"
import type { MDS_MAIN_CALLBACK as MDSMainCallbackType } from "./types"

var MDS_MAIN_CALLBACK: MDSMainCallbackType = null

var API_CALLS: any = []

export var MDS: MDSObj = {
  filehost: "",
  mainhost: "",
  minidappuid: "",
  logging: false,
  DEBUG_HOST: null,
  DEBUG_PORT: 0,
  DEBUG_MINIDAPPID: "",

  init: (callback: FullEventCallback) => {
    MDS.log("init")

    if (MDS.form.getParams("MDS_LOGGING") != null) {
      MDS.logging = true
    }

    var host = window.location.hostname
    var port = Number(window.location.port)

    MDS.minidappuid = MDS.form.getParams("uid")

    if (MDS.DEBUG_HOST != null) {
      MDS.log("DEBUG Settings Found..")

      host = MDS.DEBUG_HOST
      port = MDS.DEBUG_PORT
    }

    if (MDS.minidappuid == null) {
      MDS.minidappuid = MDS.DEBUG_MINIDAPPID
    }

    if (MDS.minidappuid == "0x00") {
      MDS.log("No MiniDAPP UID specified.. using test value")
    }

    MDS.filehost = "https://" + host + ":" + port + "/"
    MDS.mainhost = "https://" + host + ":" + port + "/mdscommand_/"
    MDS.log("MDS HOST  : " + MDS.filehost)

    MDS_MAIN_CALLBACK = callback

    PollListener()

    //And Post a message
    MDSPostMessage({ event: "inited" })
  },
  // TODO: Implement the log method
  log: (data: string) => {
    console.log("Minima @ " + new Date().toLocaleString() + " : " + data)
  },

  notify: function (output: any) {
    //Send via POST
    httpPostAsync("notify", output)
  },

  notifycancel: function () {
    //Send via POST
    httpPostAsync("notifycancel", "*")
  },

  cmd: function ({ command, params, callback }) {
    let commandString: string = command

    // Add options to the command string
    if (params) {
      const optsEntries = Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" ")

      if (optsEntries) {
        commandString += ` ${optsEntries}`
      }
    }
    console.log("commandString")
    console.log(commandString)
    //Send via POST
    httpPostAsync("cmd", commandString, callback)
  },

  sql: function (command, callback) {
    //Send via POST
    httpPostAsync("sql", command, callback)
  },

  dapplink: function (dappname, callback) {
    //Send via POST
    httpPostAsync("dapplink", dappname, function (result: any) {
      var linkdata: any = {}
      linkdata.status = result.status

      //Create the link..
      if (result.status) {
        linkdata.uid = result.response.uid
        linkdata.sessionid = result.response.sessionid
        linkdata.base =
          MDS.filehost +
          linkdata.uid +
          "/index.html?uid=" +
          result.response.sessionid
      } else {
        //Not found..
        linkdata.error = result.error
      }

      callback(linkdata)
    })
  },

  api: {
    call: function (dappname: any, data: any, callback: any) {
      //Construct a unique API request
      var rand = "" + Math.random() * 1000000000

      //Construct a callback list object
      var callitem: any = {}
      callitem.id = rand
      callitem.callback = callback

      //Add to the api calls..
      API_CALLS.push(callitem)

      //Create the single line
      var commsline = dappname + "&request&" + rand + "&" + data

      //Send via POST
      httpPostAsync("api", commsline)
    },

    reply: function (dappname: any, id: any, data: any, callback: any) {
      //Create the single line
      var commsline = dappname + "&response&" + id + "&" + data

      //Send via POST
      httpPostAsync("api", commsline, callback)
    },
  },

  net: {
    /**
     * Make a GET request
     */
    GET: function (url, callback) {
      //Send via POST
      httpPostAsync("net", url, callback)
    },

    /**
     * Make a POST request
     */
    POST: function (url, data, callback) {
      //Create the sinlg eline version..
      var postline = url + "&" + data

      //Send via POST
      httpPostAsync("net", postline, callback)
    },
  },

  /**
   *  Simple GET and SET key value pairs that are saved persistently
   */
  keypair: {
    /**
     * GET a value
     */
    get: function (key, callback) {
      //Create the single line
      var commsline = "get&" + key

      //Send via POST
      httpPostAsync("keypair", commsline, callback)
    },

    /**
     * SET a value
     */
    set: function (key, value, callback) {
      //Create the single line
      var commsline = "set&" + key + "&" + value

      //Send via POST
      httpPostAsync("keypair", commsline, callback)
    },
  },

  /**
   * COMMS - send a message to ALL minidapps or JUST your own service.js
   */
  comms: {
    /**
     * PUBLIC message broadcast to ALL (callback is optional)
     */
    broadcast: function (msg, callback) {
      //Create the single line
      var commsline = "public&" + msg

      //Send via POST
      httpPostAsync("comms", commsline, callback)
    },

    /**
     * PRIVATE message send just to this MiniDAPP (callback is optional)
     */
    solo: function (msg, callback) {
      //Create the single line
      var commsline = "private&" + msg

      //Send via POST
      httpPostAsync("comms", commsline, callback)
    },
  },

  file: {
    /**
     * List file in a folder .. start at /
     */
    list: function (folder, callback) {
      //Create the single line
      var commsline = "list&" + folder

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Save text - can be text, a JSON in string format or hex encoded data
     */
    save: function (filename, text, callback) {
      //Create the single line
      var commsline = "save&" + filename + "&" + text

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Save Binary Data - supply as a HEX string
     */
    savebinary: function (filename, hexdata, callback) {
      //Create the single line
      var commsline = "savebinary&" + filename + "&" + hexdata

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Load text - can be text, a JSON in string format or hex encoded data
     */
    load: function (filename, callback) {
      //Create the single line
      var commsline = "load&" + filename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Load Binary data - returns the HEX data
     */
    loadbinary: function (filename, callback) {
      //Create the single line
      var commsline = "loadbinary&" + filename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Delete a file
     */
    delete: function (filename, callback) {
      //Create the single line
      var commsline = "delete&" + filename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Get the full path - if you want to run a command on the file / import a txn / unsigned txn etc
     */
    getpath: function (filename, callback) {
      //Create the single line
      var commsline = "getpath&" + filename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Make a directory
     */
    makedir: function (filename, callback) {
      //Create the single line
      var commsline = "makedir&" + filename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Copy a file
     */
    copy: function (filename, newfilename, callback) {
      //Create the single line
      var commsline = "copy&" + filename + "&" + newfilename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Move a file
     */
    move: function (filename, newfilename, callback) {
      //Create the single line
      var commsline = "move&" + filename + "&" + newfilename

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Download a File from the InterWeb - Will be put in Downloads folder
     */
    download: function (url, callback) {
      //Create the single line
      var commsline = "download&" + url

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Upload a file in chunks to the /fileupload folder
     */
    upload: function (file, callback) {
      //Start the file recursion..
      _recurseUploadMDS(file, 0, callback)
    },

    /**
     * List file in a folder .. start at /
     */
    listweb: function (folder, callback) {
      //Create the single line
      var commsline = "listweb&" + folder

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Copy a file to your web folder
     */
    copytoweb: function (file, webfile, callback) {
      //Create the single line
      var commsline = "copytoweb&" + file + "&" + webfile

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },

    /**
     * Delete a file or folder from web folder
     */
    deletefromweb: function (file, callback) {
      //Create the single line
      var commsline = "deletefromweb&" + file

      //Send via POST
      httpPostAsync("file", commsline, callback)
    },
  },

  form: {
    getParams: (parameterName: string) => {
      var result = null as string | null,
        tmp = [] as string[]
      var items = window.location.search.substr(1).split("&")
      for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=")
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1])
      }
      return result
    },
  },

  util: {
    //Convert HEX to Base 64 - removes the 0x if necessary
    hexToBase64(hexstring) {
      //Check if starts with 0x
      var thex = hexstring
      if (hexstring.startsWith("0x")) {
        thex = hexstring.substring(2)
      }

      return btoa(
        (thex.match(/\w{2}/g) || [])
          .map(function (a) {
            return String.fromCharCode(parseInt(a, 16))
          })
          .join("")
      )
    },

    //Convert Base64 to HEX
    base64ToHex(str) {
      const raw = atob(str)
      let result = ""
      for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16)
        result += hex.length === 2 ? hex : "0" + hex
      }
      return result.toUpperCase()
    },

    //Convert Base64 to a Uint8Array - useful for Blobs
    base64ToArrayBuffer(base64) {
      var binary_string = window.atob(base64)
      var len = binary_string.length
      var bytes = new Uint8Array(len)
      for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i)
      }
      return bytes.buffer
    },

    //Return a state variable given the coin
    getStateVariable(coin, port) {
      //Get the state vars
      var statvars = coin.state
      var len = statvars.length
      for (var i = 0; i < len; i++) {
        var state = statvars[i]
        if (state.port == port) {
          return state.data
        }
      }

      return undefined
    },
  },
}

/**
 * POLLING Call
 */

function MDSPostMessage(json: any) {
  if (MDS_MAIN_CALLBACK) {
    //Is this an API response call..
    if (json.event == "MDSAPI") {
      //Check if it is a response..
      if (!json.data.request) {
        //Find the API CALL Object
        var found = ""
        var len = API_CALLS.length
        for (var i = 0; i < len; i++) {
          if (API_CALLS[i].id == json.data.id) {
            //found it..!
            found = json.data.id

            //Construct a reply..
            var reply: any = {}
            reply.status = json.data.status
            reply.data = json.data.message

            API_CALLS[i].callback(reply)
          }
        }

        //Remove it..
        if (found != "") {
          API_CALLS = API_CALLS.filter(function (apic: any) {
            return apic.id != found
          })
        } else {
          //MDS.log("API CALL NOT FOUND!"+JSON.stringify(json));
        }

        //Response messages not forwarded - only via API call
        return
      }
    }

    //Call the main function
    MDS_MAIN_CALLBACK(json)
  }
}

var PollCounter = 0
var PollSeries = 0
function PollListener() {
  //The POLL host
  var pollhost = MDS.mainhost + "poll?" + "uid=" + MDS.minidappuid
  var polldata = "series=" + PollSeries + "&counter=" + PollCounter

  httpPostAsyncPoll(pollhost, polldata, function (msg: any) {
    //Are we on the right Series..
    if (PollSeries != msg.series) {
      //Reset to the right series..
      PollSeries = msg.series
      PollCounter = msg.counter
    } else {
      //Is there a message ?
      if (msg.status == true) {
        //Get the current counter..
        PollCounter = msg.response.counter + 1

        //And Post the message..
        MDSPostMessage(msg.response.message)
      }
    }

    //And around we go again..
    PollListener()
  })
}

function postMDSFail<T, O, U>(command: T, params: O, status: U) {
  //Some error..
  if (MDS.logging) {
    MDS.log("** An error occurred during an MDS command!")
  }

  //Create the message
  var errormsg: ErrorMsg<T, O, U> = {
    event: "MDSFAIL",
    data: {
      command: command,
      params: params,
      status: status,
    },
  }

  //Post it to the stack
  MDSPostMessage(errormsg)
}

function httpPostAsync<T, O, U>(
  theUrl: T,
  params: O,
  callback?: (msg: U) => void
) {
  //Add the MiniDAPP UID..
  var finalurl = MDS.mainhost + theUrl + "?uid=" + MDS.minidappuid

  //Do we log it..
  if (MDS.logging) {
    MDS.log("POST_RPC:" + finalurl + " PARAMS:" + params)
  }

  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function () {
    var status = xmlHttp.status
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      if (status === 0 || (status >= 200 && status < 400)) {
        //Do we log it..
        if (MDS.logging) {
          MDS.log("RESPONSE:" + xmlHttp.responseText)
        }

        //Send it to the callback function..
        if (callback) {
          callback(JSON.parse(xmlHttp.responseText))
        }
      } else {
        //Some error..
        postMDSFail(finalurl, params, xmlHttp.status)
      }
    }
  }
  xmlHttp.open("POST", finalurl, true) // true for asynchronous
  xmlHttp.overrideMimeType("text/plain; charset=UTF-8")
  xmlHttp.send(encodeURIComponent(params as string))
  //xmlHttp.onerror = function () {
  //  console.log("** An error occurred during the transaction");
  //};
}

function httpPostAsyncPoll(theUrl: any, params: any, callback: any) {
  //Do we log it..
  if (MDS.logging) {
    MDS.log("POST_POLL_RPC:" + theUrl + " PARAMS:" + params)
  }

  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function () {
    var status = xmlHttp.status
    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
      if (status === 0 || (status >= 200 && status < 400)) {
        //Do we log it..
        if (MDS.logging) {
          MDS.log("RESPONSE:" + xmlHttp.responseText)
        }

        //Send it to the callback function..
        if (callback) {
          callback(JSON.parse(xmlHttp.responseText))
        }
      } else {
        //Some error..
        postMDSFail(theUrl, params, xmlHttp.status)
      }
    }
  }
  xmlHttp.addEventListener("error", function () {
    MDS.log("Error Polling - reconnect in 10s")
    setTimeout(function () {
      PollListener()
    }, 10000)
  })
  xmlHttp.open("POST", theUrl, true) // true for asynchronous
  xmlHttp.overrideMimeType("text/plain; charset=UTF-8")
  xmlHttp.send(encodeURIComponent(params))
}

function _recurseUploadMDS(thefullfile: any, chunk: any, callback?: any) {
  //Get some details
  var filename = thefullfile.name
  var filesize = thefullfile.size

  //1MB MAX Chunk size..
  var chunk_size = 1024 * 1024
  var allchunks = Math.ceil(filesize / chunk_size)

  //Have we finished..
  if (chunk > allchunks - 1) {
    return
  }

  var startbyte = chunk_size * chunk
  var endbyte = startbyte + chunk_size
  if (endbyte > filesize) {
    endbyte = filesize
  }

  //Get a piece of the file
  var filepiece = thefullfile.slice(startbyte, endbyte)

  //Create a form..
  var formdata = new FormData()
  formdata.append("uid", MDS.minidappuid as string)

  //Filedata handled a little differently
  formdata.append("filename", filename)
  formdata.append("filesize", filesize)
  formdata.append("allchunks", allchunks as any)
  formdata.append("chunknum", chunk)
  formdata.append("fileupload", filepiece)

  var request = new XMLHttpRequest()
  request.open("POST", "/fileuploadchunk.html")
  request.onreadystatechange = function () {
    var status = request.status
    if (request.readyState == XMLHttpRequest.DONE) {
      if (status === 0 || (status >= 200 && status < 400)) {
        //Send it to the callback function..
        if (callback) {
          var resp: any = {}
          resp.status = true
          resp.filename = filename
          resp.size = filesize
          resp.allchunks = allchunks
          resp.chunk = chunk + 1
          resp.start = startbyte
          resp.end = endbyte

          callback(resp)
        }

        //And now continue uploading..
        if (callback) {
          _recurseUploadMDS(thefullfile, chunk + 1, callback)
        } else {
          _recurseUploadMDS(thefullfile, chunk + 1)
        }
      } else {
        if (callback) {
          var resp: any = {}
          resp.status = false
          resp.error = request.responseText
          resp.filename = filename
          resp.size = filesize
          resp.allchunks = allchunks
          resp.chunk = chunk
          resp.start = startbyte
          resp.end = endbyte

          callback(resp)
        }

        //Some error..
        MDS.log("MDS FILEUPLOAD CHUNK ERROR: " + request.responseText)
      }
    }
  }

  //And finally send the POST request
  request.send(formdata)
}

window.MDS = MDS