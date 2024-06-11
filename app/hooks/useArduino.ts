import { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

type TMessage = {
  topic: string;
  message: string;
}

export const useArduino = (brokerUrl: string, options: {}) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState<TMessage | null>(null);

  useEffect(() => {
    const mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to MQTT broker');
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error: ', err);
      mqttClient.end();
    });

    mqttClient.on('message', (topic, message) => {
      setMessage({ topic, message: message.toString() });
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [brokerUrl, options]);

  const subscribe = (topic: string) => {
    if (client) {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error('Subscribe error: ', err);
        }
      });
    }
  };

  const publish = (topic: string, message: string) => {
    if (client) {
      client.publish(topic, message, (err) => {
        if (err) {
          console.error('Publish error: ', err);
        }
      });
    }
  };

  return { isConnected, message, subscribe, publish };
}