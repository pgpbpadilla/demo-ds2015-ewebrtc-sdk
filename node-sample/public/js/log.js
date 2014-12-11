/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ATT:true*/

/**
 * @author Yogesh Randhawa
 */
'use strict';

var Logger = (function () {

  return {
    ready : false,
    logconsole : null,
    init : function () {
      var logHeight = 30,
        span,
        messageNode;

      this.logconsole = document.getElementById('logconsole');

      if (!this.logconsole) {
        return;
      }

      this.logconsole.setAttribute("style", "width:100%; " + "height: " + logHeight + "%; " + "margin:0; " + "padding:0; " +
        "position:fixed; " + "left:0; " + "bottom:0; " + "overflow-y:scroll;" + "background:lightgrey; " + "z-index: 9999;");

      span = document.createElement('p');
      messageNode = document.createTextNode("Started the console on " + this.getDate() + "\u00a0 at " + this.getTime() + "\u00a0");
      span.appendChild(messageNode);

      this.logconsole.appendChild(span);

      this.ready = true;
    },

    log: function (message) {
      // check if this object is initialized
      if (this.ready || this.init()) {
        var span = document.createElement('p'),
          messageNode = document.createTextNode(this.getDate() + "\u00a0" + this.getTime() + "\u00a0" + message);

        span.appendChild(messageNode);

        this.logconsole.appendChild(span);
      }
    },

    getDate: function () {
      var now = new Date(),
        year = now.getFullYear().toString(),
        month = "0" + (now.getMonth() + 1),
        date;

      month = month.substring(month.length - 2);
      date = "0" + now.getDate();
      date = date.substring(date.length - 2);
      return year + "-" + month + "-" + date;
    },

    getTime: function () {
      var now = new Date(),
        hour = "0" + now.getHours(),
        minute,
        second;

      hour = hour.substring(hour.length - 2);
      minute = "0" + now.getMinutes();
      minute = minute.substring(minute.length - 2);
      second = "0" + now.getSeconds();
      second = second.substring(second.length - 2);
      return hour + ":" + minute + ":" + second;
    }
  };
}());

function log(message) {

  if (arguments.length === 0) {
    Logger.log('');
  } else {
    Logger.log(message);
  }
}
