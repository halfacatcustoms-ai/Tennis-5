/* =========================================================
   BECKENHAM TENNIS CLUB
   Main JavaScript
========================================================= */


/* =========================================================
   TENNIS BALL ANIMATION
========================================================= */

const ball = document.getElementById("tennis-ball");
const ballField = document.getElementById("ball-field");


/*
    We use requestAnimationFrame rather than CSS keyframes.

    This means the browser calculates the ball's position
    every frame instead of jumping between lots of fixed
    keyframes.
*/

let ballAnimationFrame = null;
let ballTimeout = null;


/* Smooth easing */

function easeInOutCubic(t) {

    if (t < 0.5) {
        return 4 * t * t * t;
    }

    return 1 - Math.pow(-2 * t + 2, 3) / 2;
}


/* Extra-smooth quintic easing */

function smootherStep(t) {

    t = Math.max(0, Math.min(1, t));

    return (
        6 * Math.pow(t, 5)
        - 15 * Math.pow(t, 4)
        + 10 * Math.pow(t, 3)
    );
}


/*
    Cubic Bézier curve.

    This lets us create a natural curved path rather than
    moving the ball in straight lines.
*/

function cubicBezier(t, p0, p1, p2, p3) {

    const oneMinusT = 1 - t;

    return (
        Math.pow(oneMinusT, 3) * p0 +
        3 * Math.pow(oneMinusT, 2) * t * p1 +
        3 * oneMinusT * Math.pow(t, 2) * p2 +
        Math.pow(t, 3) * p3
    );
}


/*
    Create the tennis serve.

    The animation consists of:

    1. Ball appears.
    2. Small controlled toss.
    3. Ball pauses naturally at the top.
    4. Ball accelerates into the serve.
    5. Ball travels across the court.
    6. Ball drops toward the LEFT service box.
    7. Ball exits through the bottom of the screen.
*/

function animateServe() {

    if (!ball || !ballField) {
        return;
    }


    cancelAnimationFrame(ballAnimationFrame);

    clearTimeout(ballTimeout);


    const width = ballField.clientWidth;
    const height = ballField.clientHeight;


    /*
        Start position.

        This is on the right side of the court.
    */

    const startX = width * 0.78;
    const startY = height * 0.24;


    /*
        The top of the toss.
    */

    const tossTopX = width * 0.785;
    const tossTopY = height * 0.12;


    /*
        Where the racket would meet the ball.
    */

    const hitX = width * 0.75;
    const hitY = height * 0.25;


    /*
        Final position.

        IMPORTANT:
        This is deliberately around the LEFT service-box
        area and below the visible court.

        So the ball disappears through the bottom rather
        than flying off the left side.
    */

    const exitX = width * 0.36;
    const exitY = height * 1.13;


    const tossDuration = 1050;
    const settleDuration = 260;
    const serveDuration = 2500;

    const totalDuration =
        tossDuration +
        settleDuration +
        serveDuration;


    const startTime = performance.now();


    ball.style.opacity = "0";
    ball.style.transform =
        `translate3d(${startX}px, ${startY}px, 0) scale(0.92)`;


    function frame(now) {

        const elapsed = now - startTime;


        /* ================================================
           PHASE 1 — TOSS
        ================================================= */

        if (elapsed <= tossDuration) {

            const rawT = elapsed / tossDuration;

            const t = smootherStep(rawT);


            /*
                Toss curve.
            */

            const x = cubicBezier(
                startX,
                startX + width * 0.005,
                tossTopX - width * 0.005,
                tossTopX
            , t);


            const y = cubicBezier(
                startY,
                startY - height * 0.12,
                tossTopY - height * 0.03,
                tossTopY
            , t);


            const scale =
                0.92 +
                0.08 * t;


            /*
                Fade in smoothly during the first
                15% of the toss.
            */

            const opacity =
                Math.min(1, rawT / 0.15);


            ball.style.opacity = opacity.toFixed(3);

            ball.style.transform =
                `translate3d(${x}px, ${y}px, 0) scale(${scale})`;


            ballAnimationFrame =
                requestAnimationFrame(frame);

            return;
        }


        /* ================================================
           PHASE 2 — SMALL NATURAL SETTLE
        ================================================= */

        if (elapsed <= tossDuration + settleDuration) {

            const phaseTime =
                elapsed - tossDuration;

            const rawT =
                phaseTime / settleDuration;

            const t =
                smootherStep(rawT);


            /*
                Ball drops very slightly from the top
                before the serve begins.

                This removes the robotic "pause".
            */

            const x =
                tossTopX +
                (hitX - tossTopX) * t;


            const y =
                tossTopY +
                (hitY - tossTopY) * t;


            ball.style.opacity = "1";

            ball.style.transform =
                `translate3d(${x}px, ${y}px, 0) scale(1)`;


            ballAnimationFrame =
                requestAnimationFrame(frame);

            return;
        }


        /* ================================================
           PHASE 3 — SERVE
        ================================================= */

        const serveElapsed =
            elapsed -
            tossDuration -
            settleDuration;


        const rawT =
            Math.min(serveElapsed / serveDuration, 1);


        /*
            Do not use a simple linear transition.

            The serve starts quickly, travels smoothly,
            then accelerates slightly as it drops.
        */

        const t = smootherStep(rawT);


        /*
            Four control points create one continuous curve.

            The ball travels:

            RIGHT SIDE
                 ↓
              across
                 ↓
            LEFT SERVICE BOX
                 ↓
              bottom
        */

        const controlX1 =
            hitX - width * 0.12;

        const controlY1 =
            hitY - height * 0.08;


        const controlX2 =
            width * 0.48;

        const controlY2 =
            height * 0.38;


        const x = cubicBezier(
            hitX,
            controlX1,
            controlX2,
            exitX,
            t
        );


        const y = cubicBezier(
            hitY,
            controlY1,
            controlY2,
            exitY,
            t
        );


        /*
            Very subtle rotation.

            Because the ball is round, this isn't really
            visible as "rotation", but it adds a tiny
            amount of natural motion.
        */

        const rotation =
            t * 820;


        /*
            Slightly increase the ball size as it gets
            closer to the viewer/bottom of the court.
        */

        const scale =
            1 +
            0.12 * t;


        /*
            Keep the ball visible throughout the serve,
            then fade it only right at the end.
        */

        let opacity = 1;

        if (rawT > 0.88) {
            opacity =
                1 -
                ((rawT - 0.88) / 0.12);
        }


        ball.style.opacity =
            Math.max(0, opacity).toFixed(3);


        ball.style.transform =
            `translate3d(${x}px, ${y}px, 0)
             scale(${scale})
             rotate(${rotation}deg)`;


        if (rawT < 1) {

            ballAnimationFrame =
                requestAnimationFrame(frame);

        } else {

            /*
                Reset completely after the ball leaves
                the bottom of the court.
            */

            ball.style.opacity = "0";

            ball.style.transform =
                `translate3d(${exitX}px, ${exitY}px, 0)
                 scale(1.12)`;


            /*
                Wait before the next serve.

                This keeps the animation special rather
                than constantly running.
            */

            ballTimeout = setTimeout(() => {
                animateServe();
            }, 4800);
        }
    }


    ballAnimationFrame =
        requestAnimationFrame(frame);
}


/* Start the animation */

if (
    !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches
) {

    /*
        Give the page a moment to load before
        the first serve.
    */

    setTimeout(() => {
        animateServe();
    }, 1800);
}


/* =========================================================
   GOOGLE CALENDAR
========================================================= */


/*
    ========================================================
    IMPORTANT

    PUT YOUR GOOGLE CALENDAR DETAILS HERE.

    You will need:

    1. Public Google Calendar ID
    2. Google Calendar API key

    Example:

    const CALENDAR_ID =
        "123abc@group.calendar.google.com";

    const GOOGLE_API_KEY =
        "AIza....................";

    Do NOT put a private password or private account
    credentials here.

    The API key should be restricted to your website
    in Google Cloud.
    ========================================================
*/


const CALENDAR_ID =
    "YOUR_GOOGLE_CALENDAR_ID_HERE";


const GOOGLE_API_KEY =
    "YOUR_GOOGLE_CALENDAR_API_KEY_HERE";


/* Number of upcoming events displayed */

const MAX_EVENTS = 4;


/* =========================================================
   FORMAT EVENT DATE
========================================================= */

function getEventDate(event) {

    /*
        Google Calendar gives us either:

        event.start.dateTime

        OR

        event.start.date

        depending on whether the event has a specific
        time or is an all-day event.
    */

    const dateValue =
        event.start?.dateTime ||
        event.start?.date;


    if (!dateValue) {
        return null;
    }


    return new Date(dateValue);
}


/* =========================================================
   DATE PARTS
========================================================= */

function getDay(date) {

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit"
        }
    ).format(date);
}


function getMonth(date) {

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            month: "short"
        }
    )
        .format(date)
        .toUpperCase();
}


function getEventTime(event, date) {

    /*
        All-day events don't need a time.
    */

    if (!event.start?.dateTime) {
        return "ALL DAY";
    }


    return new Intl.DateTimeFormat(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


/* =========================================================
   LOAD GOOGLE CALENDAR
========================================================= */

async function loadEvents() {

    const eventList =
        document.getElementById("event-list");


    if (!eventList) {
        return;
    }


    /*
        If the details haven't been added yet,
        don't show a scary error.
    */

    if (
        CALENDAR_ID.includes("YOUR_GOOGLE") ||
        GOOGLE_API_KEY.includes("YOUR_GOOGLE")
    ) {

        eventList.innerHTML = `
            <div class="events-error">
                Add your Google Calendar details to
                <strong>script.js</strong> to display
                upcoming club events.
            </div>
        `;

        return;
    }


    eventList.innerHTML = `
        <div class="events-loading">
            Loading club events<span>...</span>
        </div>
    `;


    try {

        const now =
            new Date().toISOString();


        const url =
            "https://www.googleapis.com/calendar/v3/calendars/" +
            encodeURIComponent(CALENDAR_ID) +
            "/events?" +
            "key=" +
            encodeURIComponent(GOOGLE_API_KEY) +
            "&singleEvents=true" +
            "&orderBy=startTime" +
            "&timeMin=" +
            encodeURIComponent(now) +
            "&maxResults=" +
            MAX_EVENTS;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Google Calendar request failed."
            );
        }


        const data =
            await response.json();


        const events =
            data.items || [];


        /*
            No events.
        */

        if (events.length === 0) {

            eventList.innerHTML = `
                <div class="events-error">
                    No upcoming club events.
                </div>
            `;

            return;
        }


        /*
            Build the event cards.
        */

        eventList.innerHTML = "";


        events.forEach(event => {

            const date =
                getEventDate(event);


            if (!date) {
                return;
            }


            const title =
                event.summary ||
                "Club event";


            const description =
                event.location ||
                getEventTime(event, date);


            const card =
                document.createElement("article");


            card.className =
                "event-card";


            card.innerHTML = `

                <div class="event-date">

                    <span class="event-date-day">
                        ${getDay(date)}
                    </span>

                    <span class="event-date-month">
                        ${getMonth(date)}
                    </span>

                </div>


                <div class="event-info">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <p>
                        ${escapeHTML(description)}
                    </p>

                </div>


                <div class="event-arrow">
                    ↗
                </div>
            `;


            /*
                If the Google Calendar event has a
                link, make the entire card clickable.
            */

            if (event.htmlLink) {

                card.style.cursor = "pointer";

                card.addEventListener(
                    "click",
                    () => {
                        window.open(
                            event.htmlLink,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }
                );
            }


            eventList.appendChild(card);

        });

    }

    catch (error) {

        console.error(
            "Google Calendar error:",
            error
        );


        eventList.innerHTML = `
            <div class="events-error">
                Club events could not be loaded right now.
                Please check back soon.
            </div>
        `;
    }
}


/* =========================================================
   SECURITY HELPER
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


/* =========================================================
   LOAD EVENTS
========================================================= */

loadEvents();


/*
    Refresh the calendar every 10 minutes.

    This means if someone leaves the website open and
    you add a new event to Google Calendar, the site can
    update without needing a page rebuild.
*/

setInterval(
    loadEvents,
    10 * 60 * 1000
);
