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
    // find the root element in the document
    const timerRoot = document.querySelector(`#${divPrefix}-${this.name}`);

    // apply all specified classes from json
    if (this["classes"]){
        this["classes"].forEach((cl) => {
            timerRoot.classList.add(cl);
        })
    }
    // we are prescribing the structural layout of the timer; user can still set colors, fonts, sizes, etc.
    timerRoot.style.display = 'flex';

    const timerFrag = new DocumentFragment();

    // days, hours, minutes, seconds go in a child flex container
    const timeUnits = document.createElement("div");
    timeUnits.style.display = 'flex';
    timeUnits.style["user-select"] = 'none';

    if (this["annotation"]){
        const annot = document.createElement("div");
        annot.classList.add(`${divPrefix}-internal-annotation`);
        annot.innerHTML = this["annotation"];
        timerFrag.appendChild(annot);
        switch (this["annotation-position"]){
            case "left":
                timerRoot.style["flex-direction"] = "row";
                break;
            case "right":
                timerRoot.style["flex-direction"] = "row-reverse";
                break;
            case "bottom":
                timerRoot.style["flex-direction"] = "column-reverse";
                break;
            case "top":
            default:
                timerRoot.style["flex-direction"] = "column";
                break;
        }
    }
    ['d', 'h', 'm', 's'].forEach((timeUnit) => {
        const div = document.createElement("div");
        div.classList.add(`${divPrefix}-internal-sub`, timeUnit);
        timeUnits.appendChild(div);
    });

    timerFrag.appendChild(timeUnits);
    timerRoot.appendChild(timerFrag);
}

function updateTimerFields(t){
    const daysRemaining = Math.floor(t/dayToMs);
    const hoursRemaining = Math.floor((t % dayToMs)/hourToMs);
    const minutesRemaining = Math.floor((t % hourToMs)/minuteToMs);
    const prec = (this["secondsPrecision"]) ? this["secondsPrecision"] : 0;
    const secondsRemaining = (Math.floor((t % minuteToMs)/secondToMs*Math.pow(10, prec))/Math.pow(10, prec)).toFixed(prec);
    const timerRoot = document.querySelector(`#${divPrefix}-${this.name}`);

    timerRoot.querySelector(`.${divPrefix}-internal-sub.d`).innerHTML = daysRemaining + '<span>d</span>';
    timerRoot.querySelector(`.${divPrefix}-internal-sub.h`).innerHTML = hoursRemaining + '<span>h</span>';
    timerRoot.querySelector(`.${divPrefix}-internal-sub.m`).innerHTML = minutesRemaining + '<span>m</span>';
    timerRoot.querySelector(`.${divPrefix}-internal-sub.s`).innerHTML = secondsRemaining + '<span>s</span>';
}

/* update the timer's remaining time */
function updateTimer(){
    // console.log(`update ${this["name"]}, ${this["remainingTime"]}`)
    const currentTime = new Date(Date.now());
    switch (this["timer-type"]){
        case "stopwatch":
            this["remainingTime"] = currentTime - this["start"];
            if (this["remainingTime"] >= this["target"]){
                this["remainingTime"] = this["target"];
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
            if (!t["timer-type"]) throw new Error("no timer type specified.");
            switch (t["timer-type"]){
                case "stopwatch":
                    t["start"] = new Date(Date.now());
                    t["target"] = ("target" in t) ? (parseInt(t["target"]) * secondToMs): Infinity;
                    break;
                case "countdown":
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