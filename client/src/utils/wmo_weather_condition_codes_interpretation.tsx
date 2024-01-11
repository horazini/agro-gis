type WeatherCondition = {
  day: {
    description: string;
    image: string;
  };
  night: {
    description: string;
    image: string;
  };
};

export const WMOcodesInterpretation: {
  [code: number]: WeatherCondition;
} = {
  "0": {
    day: {
      description: "Soleado",
      image: "https://openweathermap.org/img/wn/01d@2x.png",
    },
    night: {
      description: "Despejado",
      image: "https://openweathermap.org/img/wn/01n@2x.png",
    },
  },
  "1": {
    day: {
      description: "Mayormente soleado",
      image: "https://openweathermap.org/img/wn/01d@2x.png",
    },
    night: {
      description: "Mayormente despejado",
      image: "https://openweathermap.org/img/wn/01n@2x.png",
    },
  },
  "2": {
    day: {
      description: "Parcialmente nublado",
      image: "https://openweathermap.org/img/wn/02d@2x.png",
    },
    night: {
      description: "Parcialmente nublado",
      image: "https://openweathermap.org/img/wn/02n@2x.png",
    },
  },
  "3": {
    day: {
      description: "Nublado",
      image: "https://openweathermap.org/img/wn/03d@2x.png",
    },
    night: {
      description: "Nublado",
      image: "https://openweathermap.org/img/wn/03n@2x.png",
    },
  },
  "45": {
    day: {
      description: "Niebla",
      image: "https://openweathermap.org/img/wn/50d@2x.png",
    },
    night: {
      description: "Niebla",
      image: "https://openweathermap.org/img/wn/50n@2x.png",
    },
  },
  "48": {
    day: {
      description: "Escarcha",
      image: "https://openweathermap.org/img/wn/50d@2x.png",
    },
    night: {
      description: "Escarcha",
      image: "https://openweathermap.org/img/wn/50n@2x.png",
    },
  },
  "51": {
    day: {
      description: "Llovizna leve",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Llovizna leve",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "53": {
    day: {
      description: "Llovizna",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Llovizna",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "55": {
    day: {
      description: "Llovizna intensa",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Llovizna intensa",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "56": {
    day: {
      description: "LLovizna helada leve",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "LLovizna helada leve",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "57": {
    day: {
      description: "LLovizna helada",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "LLovizna helada",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "61": {
    day: {
      description: "Lluvia leve",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Lluvia leve",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "63": {
    day: {
      description: "Lluvia",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Lluvia",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "65": {
    day: {
      description: "Lluvia intensa",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Lluvia intensa",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "66": {
    day: {
      description: "Lluvia helada leve",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Lluvia helada leve",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "67": {
    day: {
      description: "Lluvia helada",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Lluvia helada",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "71": {
    day: {
      description: "Nevada leve",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Nevada leve",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "73": {
    day: {
      description: "Nieve",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Nieve",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "75": {
    day: {
      description: "Nevada intensa",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Nevada intensa",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "77": {
    day: {
      description: "Nieve",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Nieve",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "80": {
    day: {
      description: "Chubascos ligeros",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Chubascos ligeros",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "81": {
    day: {
      description: "Chubascos",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Chubascos",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "82": {
    day: {
      description: "Chubascos intensos",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Chubascos intensos",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "85": {
    day: {
      description: "Nevada leve",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Nevada leve",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "86": {
    day: {
      description: "Nieve",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Nieve",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "95": {
    day: {
      description: "Tormenta eléctrica",
      image: "https://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Tormenta eléctrica",
      image: "https://openweathermap.org/img/wn/11n@2x.png",
    },
  },
  "96": {
    day: {
      description: "Tormenta con granizo leve",
      image: "https://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Tormenta con granizo leve",
      image: "https://openweathermap.org/img/wn/11n@2x.png",
    },
  },
  "99": {
    day: {
      description: "Tormenta con granizo",
      image: "https://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Tormenta con granizo",
      image: "https://openweathermap.org/img/wn/11n@2x.png",
    },
  },
};
