/*

simpletimer-js by mikeb

*/
'use strict';

/* conversion constants */
const dayToMs = 8.64e7;
const hourToMs = 3.6e6;
const minuteToMs = 60000;
const secondToMs = 1000;

// timer declarations
// TODO remove these and get these from a json file
let timer1 = {
    "sel": '#timer1',
    "targetTime": new Date('2022-10-01 02:00:00Z'),
    "secondsPrecision": 0,
    renderTimer: renderTimer,
    updateTimer: updateTimer
};
let timer2 = {
    "sel": '#timer2',
    "targetTime": new Date('2022-09-03 21:28:00Z'),
    "secondsPrecision": 1,
    renderTimer: renderTimer,
    updateTimer: updateTimer
};

// timer constructor
// TODO use this to add methods to timer obj from json
function Timer(){
    this.renderTimer = renderTimer;
    this.updateTimer = updateTimer;
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
    document.querySelector(this.sel).classList.add('timer');
    document.querySelector(this.sel).appendChild(timerFrag);
}

/* updates the timer */
function updateTimer(){
    console.log(`update ${this["sel"]}, ${this["remainingTime"]}`)
    const currentTime = new Date(Date.now());
    this["remainingTime"] = this["targetTime"] - currentTime;
    const daysRemaining = Math.floor(this["remainingTime"]/dayToMs);
    const hoursRemaining = Math.floor((this["remainingTime"] % dayToMs)/hourToMs);
    const minutesRemaining = Math.floor((this["remainingTime"] % hourToMs)/minuteToMs);
    const secondsRemaining = (Math.floor((this["remainingTime"] % minuteToMs)/secondToMs*Math.pow(10, this["secondsPrecision"]))/Math.pow(10, this["secondsPrecision"])).toFixed(this["secondsPrecision"]);
    const timerRoot = document.querySelector(this["sel"]);

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

timer1.renderTimer();
setInterval(() => {timer1.updateTimer()}, 10);

timer2.renderTimer();
setInterval(() => {timer2.updateTimer()}, 10);