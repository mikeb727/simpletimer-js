/*

simpletimer.js - a simple javascript timer
copyright 2022 mikeb
licensed under the GNU General Public License (GPL)

*/

'use strict';

/* usage: create HTML divs whose IDs start with "simpletimer-".
   this script will attempt to create the timers within those divs. */
const divPrefix = 'simpletimer';

/* conversion constants */
const secondToMs = 1000;
const minuteToMs = 60 * secondToMs;
const hourToMs   = 60 * minuteToMs;
const dayToMs    = 24 * hourToMs;

/* define methods for the timer objects after parsing from json */
function setMethods(obj){
    obj.renderTimer = renderTimer;
    obj.updateTimer = updateTimer;
}

/* create the HTML elements for the timer */
function renderTimer(){
    const timerFrag = new DocumentFragment();
    const timerRoot = document.createElement("div");
    ['d', 'h', 'm', 's'].forEach((timeUnit) => {
        const div = document.createElement("div");
        div.classList.add('timer-sub', timeUnit);
        timerRoot.appendChild(div);
    });
    timerFrag.appendChild(timerRoot);
    document.querySelector(`#${divPrefix}-${this.name}`).appendChild(timerFrag);
    document.querySelector(`#${divPrefix}-${this.name}`).classList.add('timer');
}

/* update the timer's remaining time */
function updateTimer(){
    // console.log(`update ${this["name"]}, ${this["remainingTime"]}`)
    const currentTime = new Date(Date.now());
    this["remainingTime"] = this["target"] - currentTime;
    const daysRemaining = Math.floor(this["remainingTime"]/dayToMs);
    const hoursRemaining = Math.floor((this["remainingTime"] % dayToMs)/hourToMs);
    const minutesRemaining = Math.floor((this["remainingTime"] % hourToMs)/minuteToMs);
    const prec = ("secondsPrecision" in this) ? this["secondsPrecision"] : 0;
    const secondsRemaining = (Math.floor((this["remainingTime"] % minuteToMs)/secondToMs*Math.pow(10, prec))/Math.pow(10, prec)).toFixed(prec);
    const timerRoot = document.querySelector(`#${divPrefix}-${this.name}`);

    timerRoot.querySelector('.timer-sub.d').innerHTML = daysRemaining + '<span>d</span>';
    timerRoot.querySelector('.timer-sub.h').innerHTML = hoursRemaining + '<span>h</span>';
    timerRoot.querySelector('.timer-sub.m').innerHTML = minutesRemaining + '<span>m</span>';
    timerRoot.querySelector('.timer-sub.s').innerHTML = secondsRemaining + '<span>s</span>';

    if (daysRemaining === 0){
        timerRoot.querySelector('.timer-sub.d').style.visibility = 'hidden';
        if (hoursRemaining === 0){
            timerRoot.querySelector('.timer-sub.h').style.visibility = 'hidden';
            if (minutesRemaining === 0){
                timerRoot.querySelector('.timer-sub.m').style.visibility = 'hidden';
                if (secondsRemaining === 0){
                    timerRoot.querySelector('.timer-sub.s').style.visibility = 'hidden';
                }
            }
        }
    }
};

/* extract a set of timers from a json file */
function parseTimers(jsonPath){
    let timers = null;
    fetch(new Request(jsonPath)).then((rsp) => {
        if (rsp.status !== 200){
            throw new Error(`error reading "${jsonPath}"`);
        }
        return rsp.text();
    }).then((txt, timers) => {
        timers = JSON.parse(txt).timers;
        for (const t of timers){
            setMethods(t);
            t["target"] = new Date(t["target"]);
            t.renderTimer();
            setInterval(() => {t.updateTimer()}, 10);
        }
    })
}

parseTimers('timers.json');