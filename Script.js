/* =========================================================
   BECKENHAM TENNIS CLUB
   JAVASCRIPT
========================================================= */


/* =========================================================
   TENNIS BALL ANIMATION
========================================================= */

const ball = document.getElementById("tennis-ball");
const ballField = document.getElementById("ball-field");

let animationFrame = null;
let nextAnimation = null;


/* ---------------------------------------------------------
   SMOOTH EASING
--------------------------------------------------------- */

function smootherStep(t) {
    t = Math.max(0, Math.min(1, t));

    return (
        6 * Math.pow(t, 5)
        - 15 * Math.pow(t, 4)
        + 10 * Math.pow(t, 3)
    );
}


/* ---------------------------------------------------------
   CUBIC BEZIER
--------------------------------------------------------- */

function bezier(t, p0, p1, p2, p3) {

    const u = 1 - t;

    return (
        Math.pow(u, 3) * p0 +
        3 * Math.pow(u, 2) * t * p1 +
        3 * u * Math.pow(t, 2) * p2 +
        Math.pow(t, 3) * p3
    );
}


/* ---------------------------------------------------------
   TENNIS BALL
--------------------------------------------------------- */

function playTennisBall() {

    if (!ball || !ballField) {
        return;
    }


    cancelAnimationFrame(animationFrame);
    clearTimeout(nextAnimation);


    const width = ballField.clientWidth;
    const height = ballField.clientHeight;


    /*
        POSITION

        The ball starts around the top of the
        RIGHT service box.
    */

    const startX = width * 0.78;
    const startY = height * 0.24;


    /*
        Final position.

        This is around the LEFT service-box area,
        below the bottom of the hero.

        Because the hero has overflow:hidden,
        the ball disappears naturally when it
        travels beyond the bottom.
    */

    const exitX = width * 0.36;
    const exitY = height * 1.18;


    /*
        Timing

        Three long, smooth bounces first.
    */

    const bounceDuration = 700;

    const numberOfBounces = 3;

    const totalBounceTime =
        bounceDuration * numberOfBounces;


    /*
        Small pause before the ball launches.
    */

    const pauseDuration = 180;


    /*
        Long, smooth journey down the court.
    */

    const serveDuration = 3200;


    const startTime = performance.now();


    /*
        Reset ball.
    */

    ball.style.opacity = "1";

    ball.style.transform =
        `translate3d(${startX}px, ${startY}px, 0)
         scale(1)
         rotate(0deg)`;


    /* =====================================================
       ANIMATION LOOP
    ===================================================== */

    function animate(now) {

        const elapsed =
            now - startTime;


        /* =================================================
           PHASE 1
           THREE BOUNCES
        ================================================= */

        if (elapsed < totalBounceTime) {

            const bounceNumber =
                Math.floor(elapsed / bounceDuration);


            const bounceProgress =
                (elapsed % bounceDuration) /
                bounceDuration;


            /*
                Smooth bounce curve.

                sin() gives a genuinely continuous
                up/down movement instead of jumping
                between keyframes.
            */

            const bounceAmount =
                Math.sin(bounceProgress * Math.PI);


            /*
                Each bounce gets slightly smaller,
                making it feel like a real ball
                settling before the serve.
            */

            const bounceHeight =
                42 -
                bounceNumber * 8;


            const x =
                startX +
                Math.sin(
                    bounceProgress * Math.PI * 2
                ) * 2;


            const y =
                startY -
                bounceAmount * bounceHeight;


            /*
                Tiny scale change makes the bounce
                feel less robotic.
            */

            const scale =
                1 -
                bounceAmount * 0.025;


            ball.style.opacity = "1";

            ball.style.transform =
                `translate3d(${x}px, ${y}px, 0)
                 scale(${scale})
                 rotate(${elapsed * 0.15}deg)`;


            animationFrame =
                requestAnimationFrame(animate);

            return;
        }


        /* =================================================
           PHASE 2
           VERY SHORT SETTLE
        ================================================= */

        if (
            elapsed <
            totalBounceTime + pauseDuration
        ) {

            ball.style.opacity = "1";

            ball.style.transform =
                `translate3d(
                    ${startX}px,
                    ${startY}px,
                    0
                )
                scale(1)
                rotate(0deg)`;


            animationFrame =
                requestAnimationFrame(animate);

            return;
        }


        /* =================================================
           PHASE 3
           SERVE ACROSS COURT
        ================================================= */

        const serveElapsed =
            elapsed -
            totalBounceTime -
            pauseDuration;


        const rawProgress =
            Math.min(
                serveElapsed / serveDuration,
                1
            );


        /*
            Smooth continuous acceleration.
        */

        const progress =
            smootherStep(rawProgress);


        /*
            BEZIER CONTROL POINTS

            These create one continuous curved path
            rather than lots of individual movements.
        */

        const controlX1 =
            width * 0.76;

        const controlY1 =
            height * 0.18;


        const controlX2 =
            width * 0.50;

        const controlY2 =
            height * 0.55;


        /*
            Calculate the ball position.
        */

        const x =
            bezier(
                progress,
                startX,
                controlX1,
                controlX2,
                exitX
            );


        const y =
            bezier(
                progress,
                startY,
                controlY1,
                controlY2,
                exitY
            );


        /*
            Slightly increase the size as the ball
            travels toward the bottom.
        */

        const scale =
            1 +
            progress * 0.13;


        /*
            Ball spins continuously.

            This is subtle because the ball is round,
            but it gives the movement some life.
        */

        const rotation =
            progress * 1100;


        /*
            IMPORTANT:

            opacity NEVER changes here.

            The ball stays completely visible until
            it has physically travelled out of the
            bottom of the hero.
        */

        ball.style.opacity = "1";

        ball.style.transform =
            `translate3d(${x}px, ${y}px, 0)
             scale(${scale})
             rotate(${rotation}deg)`;


        /* =================================================
           FINISHED
        ================================================= */

        if (rawProgress < 1) {

            animationFrame =
                requestAnimationFrame(animate);

        } else {

            /*
                The ball is now below the page.

                We hide it instantly AFTER it has
                already left the visible area.

                There is NO fade.
            */

            ball.style.opacity = "0";

            ball.style.transform =
                `translate3d(
                    ${exitX}px,
                    ${exitY}px,
                    0
                )
                scale(1.13)
                rotate(${rotation}deg)`;


            /*
                Wait before the next serve.

                This gives the animation some breathing
                room instead of constantly repeating.
            */

            nextAnimation =
                setTimeout(
                    playTennisBall,
                    5000
                );
        }
    }


    animationFrame =
        requestAnimationFrame(animate);
}


/* =========================================================
   START BALL
========================================================= */

if (
    !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches
) {

    setTimeout(
        playTennisBall,
        1200
    );
}


/* =========================================================
   GOOGLE CALENDAR
========================================================= */


/*
    ========================================================
    GOOGLE CALENDAR SETTINGS

    Replace these once you have your calendar.

    Example:

    const CALENDAR_ID =
        "123456789@group.calendar.google.com";

    const GOOGLE_API_KEY =
        "AIza.....................";
    ========================================================
*/


const CALENDAR_ID =
    "YOUR_GOOGLE_CALENDAR_ID_HERE";


const GOOGLE_API_KEY =
    "YOUR_GOOGLE_CALENDAR_API_KEY_HERE";


const MAX_EVENTS = 4;


/* =========================================================
   EVENT DATE
========================================================= */

function getEventDate(event) {

    const dateValue =
        event.start?.dateTime ||
        event.start?.date;


    if (!dateValue) {
        return null;
    }


    return new Date(dateValue);
}


/* =========================================================
   EVENT DAY
========================================================= */

function getDay(date) {

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit"
        }
    ).format(date);
}


/* =========================================================
   EVENT MONTH
========================================================= */

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


/* =========================================================
   EVENT TIME
========================================================= */

function getEventTime(event, date) {

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
   SAFE HTML
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

async function loadEvents() {

    const eventList =
        document.getElementById("event-list");


    if (!eventList) {
        return;
    }


    /*
        Calendar hasn't been connected yet.
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


        if (events.length === 0) {

            eventList.innerHTML = `
                <div class="events-error">
                    No upcoming club events.
                </div>
            `;

            return;
        }


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


            const details =
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
                        ${escapeHTML(details)}
                    </p>

                </div>


                <div class="event-arrow">
                    ↗
                </div>

            `;


            if (event.htmlLink) {

                card.style.cursor =
                    "pointer";


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
   LOAD GOOGLE EVENTS
========================================================= */

loadEvents();


/*
    Refresh every 10 minutes.

    So the website can remain open while the calendar
    changes without needing the page to be rebuilt.
*/

setInterval(
    loadEvents,
    10 * 60 * 1000
);
