# simpletimer-js

**simpletimer-js** is a JavaScript library for displaying timers on a webpage. It was written mainly as an exercise in learning JavaScript syntax and coding practices, but it's still feature-rich and useful in several contexts.

## Usage

### JSON
Create a JSON file defining the timer properties. It should resemble the following:

    {
        "timers": [
            {
                "name": "timer1",
                "timer-type": "countdown",
                "target": "2023-01-01 00:00:00Z"
                "target-type": "absolute",
                "annotation": "Happy New Year!"
            },
            {
                "name": "timer2",
                "timer-type": "stopwatch",
                "target": "120",
            }
        ]
    }

The root element name must be "timers" and contain an array of objects, each of which represents a single timer. The following timer properties are currently supported:

| Property | Mandatory? | Description | Accepted values |
|---|---|---|---|
| name | Yes | A unique name for the timer. | any string |
| timer-type | No | Counting direction. "countdown" displays the remaining time until the target time is reached; "stopwatch" displays the elapsed time from when the webpage was loaded. If unspecified, "countdown" is used. | "stopwatch", "countdown" |
| target-type | Mandatory for countdowns, optional for stopwatches. | Target type. "absolute" interprets the target property as a fixed date and time, whereas "relative" interprets it as a time from when the page was loaded. | "absolute", "relative" |
| target | Mandatory for countdowns, optional for stopwatches. | Time at which to stop counting. If target-type is absolute, this should be a date-time string, and if it is relative, it should be a time period in seconds. This property can be omitted for stopwatches, in which case the timer will continue unbounded infinitely. | date string or time period in seconds |
| secondsPrecision | No | Number of decimal places to display seconds. If not specified, zero is used. | any non-negative integer |
| annotation | No | Text to be displayed alongside the timer. | any string |
| classes | No | List of CSS classes to be assigned to the timer. | array of strings |

### HTML
Include both the <code>simpletimer.js</code> file and code calling the <code>simpletimer_parse()</code> function (with the JSON file as the argument) in the HTML document in which you intend to use it. Ensure the calling script is included with the <code>defer</code> attribute (it manipulates the DOM).

    <script href="simpletimer.js"></script>
    <script defer>
        simpletimer_parse('mytimers.json');
    </script>

Create empty <code>\<div></code> elements in the document where the <code>id</code> attribute for each is the timer name defined in the JSON, with <code>simpletimer-</code> prepended:

    <div id="simpletimer-timer1"></div>

### CSS
**simpletimer-js** is designed to apply minimal layout styling to the timer and provide predictable CSS class names for its elements, which the user can build upon with additional stylesheets.