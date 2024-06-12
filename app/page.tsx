"use client"

import Image from "next/image";
import { useArduino } from "./hooks/useArduino";
import { BROKER_URL, OPTIONS } from "./constant/mqttOptions";
import { useEffect, useMemo, useState } from "react";

type MqttMessage = {
  topic: string;
  message: string;
}

export default function Home() {
  const { isConnected, message, subscribe, publish } = useArduino(BROKER_URL, OPTIONS);
  const [prevMessages, setPrevMessages] = useState<MqttMessage[]>([
    {
      topic: "plant/light",
      message: '0',
    },
    {
      topic: "plant/moisture",
      message: '0',
    },
  ]);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const parameterWrapper = "p-8";
  const lightParameter = "relative w-4 h-24 bg-white overflow-hidden";
  const waterParameter = "relative w-4 h-24 bg-white overflow-hidden";
  const basicValue = "absolute left-0 w-full h-24 ease-in duration-700 ";

  const isPumpOn = useMemo(() => {
    const isFromPump = messages.findLast(msg => msg.topic == "plant/pump");

    if (isFromPump) {
      return messages.findIndex(msg => msg.message == "pump-on") !== -1;
    }
  }, [messages]);

  const lightValue = useMemo(() => {
    const maxHeight = 96;
    const maxValue = 3600;

    if (messages[0]?.topic == "plant/light" && prevMessages[0].message !== messages[0].message) {
      const position = Math.ceil((+messages[0]?.message * maxHeight) / maxValue);

      const temp = prevMessages;
      temp[0] = messages[0];

      setPrevMessages(temp);

      return position;
    }
  }, [messages[0]?.message]);

  const waterValue = useMemo(() => {
    const maxHeight = 96;
    const maxValue = 3600;

    if (messages[1]?.topic == "plant/moisture" && prevMessages[1].message !== messages[1].message) {
      const position = Math.ceil((+messages[1]?.message * maxHeight) / maxValue);

      const temp = prevMessages;
      temp[1] = messages[1];

      setPrevMessages(temp);

      return position;
    }
  }, [messages[1]?.message]);


  useEffect(() => {
    if (isConnected) {
      subscribe('plant/light');
      subscribe('plant/moisture');
      subscribe('plant/pump');
    }
  }, [isConnected, subscribe]);

  useEffect(() => {
    if (message && messages.length == 1) {
      setMessages((prevMessages) => [...prevMessages, message]);
    } else if (message) {
      setMessages([message]);
    }
  }, [message]);

  const handleWatering = () => {
    publish('plant/pump', "watering");
  };

  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-center px-2 lg:px-24 overflow-hidden">
      <div className="flex z-10 w-full lg:max-w-5xl items-center justify-center lg:justify-between font-mono mb-16">
        <div className="bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:dark:border-neutral-800 lg:dark:bg-zinc-800/30 dark:from-inherit lg:static rounded-xl lg:border lg:bg-gray-200 p-4 lg:dark:bg-zinc-800/30">
          <Image
            className="w-60 lg:w-40"
            src="/s-pot-logo.svg"
            alt="s-pot-logo Image"
            width={240}
            height={37}
            priority
          />
        </div>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <div className={parameterWrapper}>
          <div className={lightParameter}>
            <div className={basicValue + "bg-amber-400 "} style={{ transform: `translateY(${lightValue}px)` }}></div>
          </div>
          <svg className="fill-amber-400 mt-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" /></svg>
        </div>
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src="/plant.svg"
          alt="Plant.js Image"
          width={180}
          height={37}
          priority
        />
        <div className={parameterWrapper}>
          <div className={waterParameter}>
            <div className={basicValue + "bg-blue-400 "} style={{ transform: `translateY(${waterValue}px)` }}></div>
          </div>
          <svg className="fill-blue-400 mt-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0h1.8c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192zM96 336c0-8.8-7.2-16-16-16s-16 7.2-16 16c0 61.9 50.1 112 112 112c8.8 0 16-7.2 16-16s-7.2-16-16-16c-44.2 0-80-35.8-80-80z" /></svg>
        </div>
      </div>
      <button className="flex justify-center mt-8 bg-cyan-600 px-4 py-2 rounded-xl hover:bg-cyan-900" onClick={handleWatering}>
        {
          isPumpOn ?
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" /></svg>
            :
            (<>WATERING <svg className="fill-white w-6 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M224 0c38.6 0 71.9 22.8 87.2 55.7C325.7 41.1 345.8 32 368 32c38.7 0 71 27.5 78.4 64H448c35.3 0 64 28.7 64 64s-28.7 64-64 64H128c-35.3 0-64-28.7-64-64s28.7-64 64-64c0-53 43-96 96-96zM140.6 292.3l-48 80c-6.8 11.4-21.6 15-32.9 8.2s-15.1-21.6-8.2-32.9l48-80c6.8-11.4 21.6-15.1 32.9-8.2s15.1 21.6 8.2 32.9zm327.8-32.9c11.4 6.8 15 21.6 8.2 32.9l-48 80c-6.8 11.4-21.6 15-32.9 8.2s-15-21.6-8.2-32.9l48-80c6.8-11.4 21.6-15.1 32.9-8.2zM252.6 292.3l-48 80c-6.8 11.4-21.6 15-32.9 8.2s-15.1-21.6-8.2-32.9l48-80c6.8-11.4 21.6-15.1 32.9-8.2s15.1 21.6 8.2 32.9zm103.8-32.9c11.4 6.8 15 21.6 8.2 32.9l-48 80c-6.8 11.4-21.6 15-32.9 8.2s-15.1-21.6-8.2-32.9l48-80c6.8-11.4 21.6-15.1 32.9-8.2zM306.5 421.9C329 437.4 356.5 448 384 448c26.9 0 55.4-10.8 77.4-26.1l0 0c11.9-8.5 28.1-7.8 39.2 1.7c14.4 11.9 32.5 21 50.6 25.2c17.2 4 27.9 21.2 23.9 38.4s-21.2 27.9-38.4 23.9c-24.5-5.7-44.9-16.5-58.2-25C449.5 501.7 417 512 384 512c-31.9 0-60.6-9.9-80.4-18.9c-5.8-2.7-11.1-5.3-15.6-7.7c-4.5 2.4-9.7 5.1-15.6 7.7c-19.8 9-48.5 18.9-80.4 18.9c-33 0-65.5-10.3-94.5-25.8c-13.4 8.4-33.7 19.3-58.2 25c-17.2 4-34.4-6.7-38.4-23.9s6.7-34.4 23.9-38.4c18.1-4.2 36.2-13.3 50.6-25.2c11.1-9.4 27.3-10.1 39.2-1.7l0 0C136.7 437.2 165.1 448 192 448c27.5 0 55-10.6 77.5-26.1c11.1-7.9 25.9-7.9 37 0z" /></svg></>)
        }
      </button>
    </main >
  );
}
