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
    obj.updateTimerFields = updateTimerFields;
}

/* create the HTML elements for the timer */
function renderTimer(){
    const timerRoot = document.querySelector(`#${divPrefix}-${this.name}`);
    if (this["classes"]){
        this["classes"].forEach((cl) => {
            timerRoot.classList.add(cl);
        })
    }
    timerRoot.style.display = 'flex';
    // create flex container under this (two if using an annotation)
    const timerFrag = new DocumentFragment();
    const timeUnits = document.createElement("div");
    timeUnits.style.display = 'flex';
    ['d', 'h', 'm', 's'].forEach((timeUnit) => {
        const div = document.createElement("div");
        div.classList.add(`${divPrefix}-sub`, timeUnit);
        timeUnits.appendChild(div);
    });
    timerFrag.appendChild(timeUnits);
    timerRoot.appendChild(timerFrag);
}

function updateTimerFields(t){
    const daysRemaining = Math.floor(t/dayToMs);
    const hoursRemaining = Math.floor((t % dayToMs)/hourToMs);
    const minutesRemaining = Math.floor((t % hourToMs)/minuteToMs);
    const prec = ("secondsPrecision" in this) ? this["secondsPrecision"] : 0;
    const secondsRemaining = (Math.floor((t % minuteToMs)/secondToMs*Math.pow(10, prec))/Math.pow(10, prec)).toFixed(prec);
    const timerRoot = document.querySelector(`#${divPrefix}-${this.name}`);

    timerRoot.querySelector(`.${divPrefix}-sub.d`).innerHTML = daysRemaining + '<span>d</span>';
    timerRoot.querySelector(`.${divPrefix}-sub.h`).innerHTML = hoursRemaining + '<span>h</span>';
    timerRoot.querySelector(`.${divPrefix}-sub.m`).innerHTML = minutesRemaining + '<span>m</span>';
    timerRoot.querySelector(`.${divPrefix}-sub.s`).innerHTML = secondsRemaining + '<span>s</span>';
}

/* update the timer's remaining time */
function updateTimer(){
    // console.log(`update ${this["name"]}, ${this["remainingTime"]}`)
    const currentTime = new Date(Date.now());
    switch (this["timer-type"]){
        case "stopwatch":
            this["remainingTime"] = currentTime - this["start"];
            if (this["remainingTime"] >= this["target"]){
                this.updateTimerFields(this["remainingTime"]);
                clearInterval(this["updIntvId"]);
            }
            break;
        case "countdown":
        default:
            this["remainingTime"] = this["target"] - currentTime;
            if (this["remainingTime"] <= 0){
                this["remainingTime"] = 0;
                this.updateTimerFields(this["remainingTime"]);
                clearInterval(this["updIntvId"]);
            }
            break;
    }

    this.updateTimerFields(this["remainingTime"]);

    // if (daysRemaining === 0){
    //     timerRoot.querySelector('.timer-sub.d').style.visibility = 'hidden';
    //     if (hoursRemaining === 0){
    //         timerRoot.querySelector('.timer-sub.h').style.visibility = 'hidden';
    //         if (minutesRemaining === 0){
    //             timerRoot.querySelector('.timer-sub.m').style.visibility = 'hidden';
    //             if (secondsRemaining === 0){
    //                 timerRoot.querySelector('.timer-sub.s').style.visibility = 'hidden';
    //             }
    //         }
    //     }
    // }
}

/* extract a set of timers from a json file */
function simpletimer_parse(jsonPath){
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
            switch (t["timer-type"]){
                case "stopwatch":
                    t["start"] = new Date(Date.now());
                    t["target"] = ("target" in t) ? (parseInt(t["target"]) * secondToMs): Infinity;
                    break;
                case "countdown":
                default:
                    switch (t["target-type"]){
                        case "relative":
                            t["target"] = new Date(Date.now() + (parseInt(t["target"]) * secondToMs));
                            break;
                        case "absolute":
                        default:
                            t["target"] = new Date(t["target"]);
                            break;                
                    }
            }
            t.renderTimer();
            t["updIntvId"] = setInterval(() => {t.updateTimer()}, 10);
        }
    })
}