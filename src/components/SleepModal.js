import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { SleepContext } from "../contexts"
import { AddSleepEntry } from "../utils/api"
import TimePicker from "./TimePicker"
import Mood from "./Mood"
import zzz from "../assets/zzz.gif"

const Style = styled.div`
  position: fixed;
  top:0;
  z-index: 9999;
  width:100%;
  height: 100%;
  background: rgb(0,0,0,0.5);
  > div {
    
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    width:50%;
    min-width: 300px;
    margin: 20% auto;
    padding: 2rem 0;
    > div {
      display: flex;
      align-items: center;
    }
    > button {
      width: 50%;
    }
  }
`
const SubStyle =styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
    }
    > button {
      width: 50%;
    }
`

const Snooze = styled.div`
  background-image: url(${zzz});
  background-size: cover;
  height: 10rem;
  width: 10rem;
`

function StartSleep({ setSleepState }) {
  return (
    <SubStyle>
      <h3>Rate how you felt during the day.</h3>
      <Mood name="duringDay" />
      <h3>Rate how you feel right now.</h3>
      <Mood name="beforeSleep" />
      <TimePicker starting />
      <button onClick={() => setSleepState("sleeping")}>Start Sleep</button>
    </SubStyle>
  )
}

function Asleep({ setSleepState }) {
  return (
    <SubStyle>
      <Snooze />
      <button onClick={() => setSleepState("wakeup")}>Wake Up</button>
    </SubStyle>
  )
}

function WakeUp({ saveEntry }) {
  return (
    <SubStyle>
      <h3>Rate how well you slept.</h3>
      <Mood name="afterSleep" />
      <TimePicker />
      <button onClick={saveEntry}>Save Sleep Entry</button>
    </SubStyle>
  )
}

export default function SleepModal(props) {
  const [sleepState, setSleepState] = useState("goingtosleep")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [start, setStart] = useState()
  const [end, setEnd] = useState()
  const [mood, setMood] = useState({
    duringDay: "",
    beforeSleep: "",
    afterSleep: ""
  })
  const [sleepEntry, setSleepEntry] = useState({
    userId: props.userId,
    dateTimeFrom: "",
    dateTimeTo: "",
    feels: "",
    notes: "placeholder"
  })

  useEffect(() => {
    setSleepEntry(entry => ({
      ...entry,
      feels: Math.round(
        (mood.duringDay + mood.beforeSleep + mood.afterSleep) / 3
      )
    }))
  }, [mood])

  useEffect(() => {
    setSleepEntry(entry => ({
      ...entry,
      dateTimeFrom: start
    }))
  }, [start])

  useEffect(() => {
    setSleepEntry(entry => ({
      ...entry,
      dateTimeTo: end
    }))
  }, [end])

  const saveEntry = async () => {
    setLoading(true)
    try {
      await AddSleepEntry(sleepEntry)
      setLoading(false)
      props.setIsAdding(false)
    } catch (error) {
      setLoading(false)
      setError(error.response)
    }
  }
  console.log(sleepEntry)
  return (
    <SleepContext.Provider
      value={{ start, setStart, end, setEnd, mood, setMood }}
    >
      <Style>
        <div>
          {error && <div>{error}</div>}
          {loading && <div>Loading...</div>}
          {!loading && sleepState === "goingtosleep" && (
            <StartSleep setSleepState={setSleepState} />
          )}
          {!loading && sleepState === "sleeping" && (
            <Asleep setSleepState={setSleepState} />
          )}
          {!loading && sleepState === "wakeup" && (
            <WakeUp saveEntry={saveEntry} />
          )}
        </div>
      </Style>
    </SleepContext.Provider>
  )
}
