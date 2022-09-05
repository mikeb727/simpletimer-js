/*

simpletimer-js by mikeb

*/

'use strict';

/* conversion constants */
const secondToMs = 1000;
const minuteToMs = 60 * secondToMs;
const hourToMs   = 60 * minuteToMs;
const dayToMs    = 24 * hourToMs;

function setMethods(obj){
    obj.renderTimer = renderTimer;
    obj.updateTimer = updateTimer;
}

/* creates HTML for the timer */
function renderTimer(){
    const timerFrag = new DocumentFragment();
    const leftPad = document.createElement("div"); leftPad.classList.add('timer-pad');
    const rightPad = document.createElement("div"); rightPad.classList.add('timer-pad');
    const timerRoot = document.createElement("div");
    ['d', 'h', 'm', 's'].forEach((unit) => {
        const div = document.createElement("div");
        div.classList.add('timer-sub', unit);
        timerRoot.appendChild(div);
    });
    [leftPad, timerRoot, rightPad].forEach((div) => {
        timerFrag.appendChild(div);
    });
    document.querySelector(`#${this.name}`).classList.add('timer');
    document.querySelector(`#${this.name}`).appendChild(timerFrag);
}

/* updates the timer */
function updateTimer(){
    console.log(`update ${this["name"]}, ${this["remainingTime"]}`)
    const currentTime = new Date(Date.now());
    this["remainingTime"] = this["targetStamp"] - currentTime;
    const daysRemaining = Math.floor(this["remainingTime"]/dayToMs);
    const hoursRemaining = Math.floor((this["remainingTime"] % dayToMs)/hourToMs);
    const minutesRemaining = Math.floor((this["remainingTime"] % hourToMs)/minuteToMs);
    const secondsRemaining = (Math.floor((this["remainingTime"] % minuteToMs)/secondToMs*Math.pow(10, this["secondsPrecision"]))/Math.pow(10, this["secondsPrecision"])).toFixed(this["secondsPrecision"]);
    const timerRoot = document.querySelector(`#${this.name}`);

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

const timer3Req = new Request('timers.json');
let timers = null;
fetch(timer3Req).then((rsp) => {
    if (!rsp.ok){
        throw new Error('could not read json');
    }
    return rsp.text();
}).then((rsp) => {
    timers = JSON.parse(rsp);
    for (const t of timers.timers){
        t.targetStamp = new Date(t["target"]);
        setMethods(t);
        t.renderTimer();
        setInterval(() => {t.updateTimer()}, 10);
    }
})

