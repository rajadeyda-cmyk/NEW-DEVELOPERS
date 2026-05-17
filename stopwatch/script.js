const timeDisplay = document.getElementById("time-display");
const startStopBtn = document.getElementById("start-stop-btn");
const lapBtn = document.getElementById("lap-btn");
const resetBtn = document.getElementById("reset-btn");
const lapsList = document.getElementById("laps-list");
const lapsHeading = document.getElementById("laps-heading");

//	When	we	last	hit	"Start".	null	when	paused	or	reset.
let	startTime	=	null;
//	Time	accumulated	from	previous	run	sessions	(before	the
//	current	run	started).	This	is	what	makes	pause/resume	work.
let	elapsedBeforePause	=	0;
//	The	setInterval	handle,	so	we	can	cancel	it.
let	intervalId	=	null;
//	Array	of	lap	times.
let	laps	=	[];

//	Returns	the	total	elapsed	time	in	milliseconds.
//	Combines	time	from	past	runs	plus	current	run	(if	running).
function	getElapsedMs()	{
if	(startTime	===	null)	{
//	Paused	or	reset	—	just	return	the	saved	total.
return	elapsedBeforePause;
}
//	Running	—	saved	total	+	how	long	since	we	last	hit	Start.
return	elapsedBeforePause	+	(Date.now()	-	startTime);
}
//	Format	a	millisecond	value	as	"MM:SS.cc"
function	formatTime(ms)	{
const	totalSeconds	=	Math.floor(ms	/	1000);
const	minutes	=	Math.floor(totalSeconds	/	60);
const	seconds	=	totalSeconds	%	60;
const	centis	=	Math.floor((ms	%	1000)	/	10);
const	mm	=	String(minutes).padStart(2,	"0");
const	ss	=	String(seconds).padStart(2,	"0");
const	cc	=	String(centis).padStart(2,	"0");
return	`${mm}:${ss}.${cc}`;
}
function	tick()	{
timeDisplay.textContent	=	formatTime(getElapsedMs());
}

function	start()	{
startTime	=	Date.now();
//	Update	the	display	roughly	every	10ms.
intervalId	=	setInterval(tick,	10);
//	Switch	the	button	to	"Stop".
startStopBtn.textContent	=	"Stop";
startStopBtn.classList.remove("btn--start");
startStopBtn.classList.add("btn--stop");
//	Lap	is	only	meaningful	while	running.
lapBtn.disabled	=	false;
}
function	stop()	{
//	Add	this	run's	duration	to	our	saved	total.
elapsedBeforePause	+=	Date.now()	-	startTime;
startTime	=	null;
//	Stop	the	ticking.
clearInterval(intervalId);
intervalId	=	null;
//	Switch	the	button	back	to	"Start".
startStopBtn.textContent	=	"Start";
startStopBtn.classList.remove("btn--stop");
startStopBtn.classList.add("btn--start");
	// No laps while paused.
	lapBtn.disabled = true;
	// Render once more to make sure the final value shows.
tick();
}

startStopBtn.addEventListener("click",	function	()	{
//	Toggle:	if	running,	stop;	if	not,	start.
if	(intervalId	===	null)	{
start();
}	else	{
stop();
}
});

function	reset()	{
//	Stop	the	interval	if	running.
if	(intervalId	!==	null)	{
clearInterval(intervalId);
intervalId	=	null;
}
startTime	=	null;
elapsedBeforePause	=	0;
laps	=	[];
//	Reset	UI.
timeDisplay.textContent	=	formatTime(0);
startStopBtn.textContent	=	"Start";
startStopBtn.classList.remove("btn--stop");
startStopBtn.classList.add("btn--start");
lapBtn.disabled	=	true;
renderLaps();
}
resetBtn.addEventListener("click",	reset);


function	recordLap()	{
const	totalElapsed	=	getElapsedMs();
//	The	split	time	for	this	lap	=	total	elapsed	minus
//	the	sum	of	all	previous	lap	times.
const	sumOfPreviousLaps	=	laps.reduce(function	(sum,	lap)	{
return	sum	+	lap.split;
},	0);
const	splitMs	=	totalElapsed	-	sumOfPreviousLaps;
laps.push({
split:	splitMs,
total:	totalElapsed
});
renderLaps();
}

lapBtn.addEventListener("click",	recordLap);

function	renderLaps()	{
		lapsList.innerHTML	=	"";
		if	(laps.length	===	0)	{
				lapsHeading.classList.add("laps-heading--hidden");
				return;
		}
		lapsHeading.classList.remove("laps-heading--hidden");
		//	Find	fastest	and	slowest	splits	(only	meaningful	with	2+	laps).
		let	fastestIndex	=	-1;
		let	slowestIndex	=	-1;
		if	(laps.length	>=	2)	{
				let	minSplit	=	Infinity;
				let	maxSplit	=	-Infinity;
				laps.forEach(function	(lap,	i)	{
						if	(lap.split	<	minSplit)	{
								minSplit	=	lap.split;
								fastestIndex	=	i;
						}
						if	(lap.split	>	maxSplit)	{
								maxSplit	=	lap.split;
								slowestIndex	=	i;
						}
				});
		}
		//	Build	the	rows.	Newest	laps	go	on	top.
		for	(let	i	=	laps.length	-	1;	i	>=	0;	i--)	{
				const	lap	=	laps[i];
				const	li	=	document.createElement("li");
				li.className	=	"lap-item";
				if	(i	===	fastestIndex)	li.classList.add("lap-item--fastest");
				if	(i	===	slowestIndex)	li.classList.add("lap-item--slowest");
				const	numberSpan	=	document.createElement("span");
				numberSpan.className	=	"lap-number";
				numberSpan.textContent	=	`Lap	${i	+	1}`;
				const	splitSpan	=	document.createElement("span");
				splitSpan.className	=	"lap-split";
				splitSpan.textContent	=	formatTime(lap.split);
				const	totalSpan	=	document.createElement("span");
				totalSpan.className	=	"lap-total";
				totalSpan.textContent	=	formatTime(lap.total);
				li.appendChild(numberSpan);
				li.appendChild(splitSpan);
				li.appendChild(totalSpan);
				lapsList.appendChild(li);
		}
}

