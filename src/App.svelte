<script lang="ts">
  import Icon from "svelte-awesome";
  import { play, pause, cog, times, github } from "svelte-awesome/icons";
  import { checkCookie, setCookie, getCookie } from "./helpers/cookie-helper";

  //#region Cookies
  const pocusMinsCookie = "pocus_pocusMinutes";
  const pocusSecsCookie = "pocus_pocusSeconds";
  const breakMinsCookie = "pocus_breakMinutes";
  const breakSecsCookie = "pocus_breakSeconds";
  const longBreakMinsCookie = "pocus_longBreakMinutes";
  const longBreakSecsCookie = "pocus_longBreakSeconds";
  const numTillLongBreakCookie = "pocus_numTillLongBreak";
  //#endregion Cookies

  //#region Settings
  let settings = {
    [pocusMinsCookie]: checkCookie(pocusMinsCookie)
      ? parseInt(getCookie(pocusMinsCookie))
      : 25,
    [pocusSecsCookie]: checkCookie(pocusSecsCookie)
      ? parseInt(getCookie(pocusSecsCookie))
      : 0,
    [numTillLongBreakCookie]: checkCookie(numTillLongBreakCookie)
      ? parseInt(getCookie(numTillLongBreakCookie))
      : 4,
    [breakMinsCookie]: checkCookie(breakMinsCookie)
      ? parseInt(getCookie(breakMinsCookie))
      : 5,
    [breakSecsCookie]: checkCookie(breakSecsCookie)
      ? parseInt(getCookie(breakSecsCookie))
      : 0,
    [longBreakMinsCookie]: checkCookie(longBreakMinsCookie)
      ? parseInt(getCookie(longBreakMinsCookie))
      : 15,
    [longBreakSecsCookie]: checkCookie(longBreakSecsCookie)
      ? parseInt(getCookie(longBreakSecsCookie))
      : 0,
  };
  //#endregion Settings

  //#region Setup
  if (!checkCookie(pocusMinsCookie)) {
    setCookie(pocusMinsCookie, settings.pocus_pocusMinutes.toString());
  }
  if (!checkCookie(pocusSecsCookie)) {
    setCookie(pocusSecsCookie, settings.pocus_pocusSeconds.toString());
  }
  if (!checkCookie(breakMinsCookie)) {
    setCookie(breakMinsCookie, settings.pocus_breakMinutes.toString());
  }
  if (!checkCookie(breakSecsCookie)) {
    setCookie(breakSecsCookie, settings.pocus_breakSeconds.toString());
  }
  if (!checkCookie(longBreakMinsCookie)) {
    setCookie(longBreakMinsCookie, settings.pocus_longBreakMinutes.toString());
  }
  if (!checkCookie(longBreakSecsCookie)) {
    setCookie(longBreakSecsCookie, settings.pocus_longBreakSeconds.toString());
  }
  if (!checkCookie(numTillLongBreakCookie)) {
    setCookie(
      numTillLongBreakCookie,
      settings.pocus_numTillLongBreak.toString()
    );
  }

  const _pocus: string = "POCUS";
  const _paused: string = "PAUSED";
  const _break: string = "BREAK";
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  let title: string = _pocus;
  let isPaused = true;
  let isBreak = false;
  let pocusCount: number = 0;
  let remainingMins: string = pad(settings.pocus_pocusMinutes);
  let remainingSecs: string = pad(settings.pocus_pocusSeconds);
  let settingsVisible: boolean = false;
  //#endregion Setup

  //#region Timer Functions
  function playPause(): void {
    if (isPaused) {
      isPaused = false;
      startTimer(parseInt(remainingMins), parseInt(remainingSecs));
    } else {
      isPaused = true;
      title = _paused;
    }
  }

  function startTimer(minutes: number, seconds: number): void {
    let startTime = new Date().toString();
    let countDown =
      new Date(startTime).getTime() + minutes * minute + seconds * second;
    let x = setInterval(function () {
      let now: number = new Date().getTime();
      let distance: number = countDown - now;

      remainingMins = pad(Math.floor((distance % hour) / minute));
      remainingSecs = pad(Math.floor((distance % minute) / second));

      workoutWheelPercentage();

      //do something later when date is reached
      if (distance < 0 || isPaused) {
        clearInterval(x);

        if (distance < 0) {
          remainingMins = pad(settings.pocus_pocusMinutes);
          remainingSecs = pad(settings.pocus_pocusSeconds);
          title = _pocus;
          isBreak = !isBreak;
          isPaused = true;
          playPing();
          saveSettings();

          if (isBreak) {
            pocusCount += 1;
            title = _break;
            remainingMins = pad(settings.pocus_breakMinutes);
            remainingSecs = pad(settings.pocus_breakSeconds);

            if (pocusCount == settings.pocus_numTillLongBreak) {
              pocusCount = 0;
              remainingMins = pad(settings.pocus_longBreakMinutes);
              remainingSecs = pad(settings.pocus_longBreakSeconds);
            }
          }

          workoutWheelPercentage();
        }
      }
      //seconds
    }, 0);
  }
  //#endregion Timer Functions

  //#region Helper Functions
  function playPing() {
    new Audio("assets/ping.mp3").play();
  }

  function pad(n: number): string {
    return n < 10 ? "0" + n.toString() : n.toString();
  }

  function saveSettings() {
    for (const key in settings) {
      setCookie(key, settings[key]);
    }
  }

  function toggleSettingsVisible() {
    settingsVisible = !settingsVisible;
  }

  function calculatePercentageDone(minutes: number, seconds: number): number {
    const settingsMins = !isBreak
      ? settings.pocus_pocusMinutes
      : settings.pocus_breakMinutes;
    const settingsSecs = !isBreak
      ? settings.pocus_pocusSeconds
      : settings.pocus_breakSeconds;

    return (
      ((minutes * minute + seconds * second) /
        (settingsMins * minute + settingsSecs * second)) *
      100
    );
  }

  function workoutWheelPercentage() {
    document.getElementById("timer").style.background = `conic-gradient(var(${
      !isBreak ? "--clr-pocus" : "--clr-break"
    }) ${calculatePercentageDone(
      parseInt(remainingMins),
      parseInt(remainingSecs)
    )}%, var(--clr-mute) 0)`;
  }
  //#endregion Helper Functions
</script>

<main>
  <h1 class={isPaused ? "" : "hidden"}>{title}</h1>
  <div
    id="timer"
    class={isPaused
      ? isBreak
        ? "timer timer--break"
        : "timer"
      : isBreak
      ? "timer timer--active timer--break"
      : "timer timer--active"}
  >
    <button id="start" on:click={playPause}>
      {#if isPaused}
        <Icon data={play} scale="5" />
      {/if}
      {#if !isPaused}
        <Icon data={pause} scale="5" />
      {/if}</button
    >
    <ul>
      <li><span id="minutes">{remainingMins}</span>Minutes</li>
      <li><span id="colon">:</span></li>
      <li><span id="seconds">{remainingSecs}</span>Seconds</li>
    </ul>
  </div>
  <button class="settings__button" on:click={toggleSettingsVisible}
    ><Icon style="margin-top: 0.25rem" data={cog} scale="3" /></button
  >
  <a href="https://github.com/ExistentialAlex" target="_blank" class="github"
    ><Icon
      style="margin-top: 0.25rem; margin-left:0.45rem"
      data={github}
      scale="3"
    /></a
  >
  <div
    id="settings"
    class={settingsVisible ? "settings" : "settings settings__hidden"}
  >
    <h2>Settings</h2>
    <form on:submit={saveSettings}>
      <div>
        <label for="pocus_minutes">Pocus Minutes</label>
        <input
          id="pocus_minutes"
          type="number"
          bind:value={settings.pocus_pocusMinutes}
        />
      </div>
      <div>
        <label for="pocus_seconds">Pocus Seconds</label>
        <input
          id="pocus_seconds"
          type="number"
          bind:value={settings.pocus_pocusSeconds}
        />
      </div>
      <div>
        <label for="break_minutes">Break Minutes</label>
        <input
          id="break_minutes"
          type="number"
          bind:value={settings.pocus_breakMinutes}
        />
      </div>
      <div>
        <label for="break_seconds">Break Seconds</label>
        <input
          id="break_seconds"
          type="number"
          bind:value={settings.pocus_breakSeconds}
        />
      </div>
      <div>
        <label for="long_break_minutes">Long Break Minutes</label>
        <input
          id="long_break_minutes"
          type="number"
          bind:value={settings.pocus_longBreakMinutes}
        />
      </div>
      <div>
        <label for="long_break_seconds">Long Break Seconds</label>
        <input
          id="long_break_seconds"
          type="number"
          bind:value={settings.pocus_longBreakSeconds}
        />
      </div>
      <div>
        <label for="num_till_long_break">Number of Pocus' till long break</label
        >
        <input
          id="num_till_long_break"
          type="number"
          bind:value={settings.pocus_numTillLongBreak}
        />
      </div>
      <p>Settings also saved after pocus is completed</p>
      <button type="submit">Save and Refresh</button>
    </form>
    <button class="settings__close" on:click={toggleSettingsVisible}
      ><Icon data={times} scale="3" /></button
    >
  </div>
</main>

<style lang="scss">
  :root {
    --clr-break: #2cc09c;
    --clr-pocus: #5b54ca;
    --clr-mute: #e9e9e9;
    --clr-mute-text: #b6b6b6;
    --transition-time: 500ms;
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;

    & > h1 {
      color: var(--clr-pocus);
      text-transform: uppercase;
      font-size: 4em;
      font-weight: 100;
      opacity: 1;
      transition: all var(--transition-time) ease;

      &.hidden {
        opacity: 0;
      }
    }
  }

  .timer {
    border-radius: 50%;
    // border: 5px solid var(--clr-pocus);
    height: 20rem;
    width: 20rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all var(--transition-time) ease;
    position: relative;
    bottom: 0;
    background: conic-gradient(var(--clr-pocus) 100%, var(--clr-mute) 0);

    &--active {
      bottom: 10rem;
    }

    &--break {
      border-color: var(--clr-break);
    }
  }

  #start {
    position: absolute;
    padding-top: 1rem;
    background-color: transparent;
    border: none;
    opacity: 0;
    transition: opacity var(--transition-time) ease;

    &:hover {
      opacity: 1;
    }
  }

  ul {
    padding: 0;
    display: flex;
    background: #ffffff;
    width: 97%;
    height: 97%;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  li {
    display: flex;
    font-size: 0.5rem;
    list-style-type: none;
    padding: 1em;
    text-transform: uppercase;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    span {
      display: block;
      font-size: 4.5rem;
    }

    #colon {
      font-size: 2rem;
    }
  }

  .settings {
    width: 100%;
    padding: 1rem;
    position: fixed;
    bottom: 0;
    border-top: 1px solid var(--clr-mute);
    background-color: #ffffff;
    transition: bottom ease var(--transition-time);

    & > h2 {
      text-align: center;
      margin: 0;
      margin-bottom: 0.75rem;
      color: var(--clr-pocus);
      text-transform: uppercase;
      font-weight: 200;
    }

    & > form {
      display: flex;
      flex-wrap: wrap;
      position: relative;
      justify-content: center;
      padding-bottom: 4rem;

      & > div {
        margin: 0 1rem 0.5rem;
        flex: 1 1 0px;
        & > label {
          text-align: center;
          white-space: nowrap;
        }

        & > input {
          width: 100%;
        }
      }

      & > button {
        position: absolute;
        bottom: 1rem;
        background-color: var(--clr-break);
        border: none;
        padding: 0.5rem 2rem;
        font-size: 1.1rem;
        font-weight: 500;
        border-radius: 2rem;
        color: #ffffff;
      }
      & > p {
        font-size: 0.9rem;
        color: var(--clr-mute-text);
        position: absolute;
        bottom: -1.25rem;
      }
    }

    &__button,
    &__close {
      cursor: pointer;
      position: fixed;
      margin-right: 1rem;
      margin-bottom: 1rem;
      padding: 0;
      border: none;
      background-color: transparent;
      border-radius: 50%;
      height: 3.5rem;
      width: 3.5rem;
      transition: background-color ease var(--transition-time);

      &:hover {
        background-color: var(--clr-mute);
      }
    }

    &__button {
      bottom: 0;
      right: 0;
    }

    &__close {
      right: 0.5rem;
      top: 0.5rem;
      bottom: none;
      position: absolute;
    }

    &__hidden {
      bottom: -40rem;
    }
  }

  .github {
    color: #000000;
    cursor: pointer;
    position: fixed;
    margin-left: 1rem;
    margin-bottom: 1rem;
    padding: 0;
    border: none;
    background-color: transparent;
    border-radius: 50%;
    height: 3.5rem;
    width: 3.5rem;
    transition: background-color ease var(--transition-time);
    bottom: 0;
    left: 0;

    &:hover {
      background-color: var(--clr-mute);
    }
  }
</style>
