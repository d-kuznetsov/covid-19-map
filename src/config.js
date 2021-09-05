export const coronaApi =
  "https://corona.lmao.ninja/v2/countries?yesterday&sort";

export const curCountryItemsCfg = [
  {
    label: "Country",
    field: "country",
    cssClasses: "",
  },
  {
    label: "Active",
    field: "active",
    cssClasses: "text-red",
  },
  {
    label: "Recovered",
    field: "recovered",
    cssClasses: "text-green",
  },
  {
    label: "Tests",
    field: "tests",
    cssClasses: "text-green",
  },
  {
    label: "Deaths",
    field: "deaths",
    cssClasses: "text-red",
  },
  {
    label: "Population",
    field: "population",
    cssClasses: "",
  },
  {
    label: "Active per 1 Million",
    field: "activePerOneMillion",
    cssClasses: "text-red",
  },
  {
    label: "Recovered per 1 Million",
    field: "recoveredPerOneMillion",
    cssClasses: "text-green",
  },
  {
    label: "Tests per 1 Million",
    field: "testsPerOneMillion",
    cssClasses: "text-green",
  },
  {
    label: "Deaths per 1 Million",
    field: "deathsPerOneMillion",
    cssClasses: "text-red",
  },
];

export const categoryItemsCfg = {
  activePerOneMillion: {
    label: "active per 1 million",
    color: "r",
  },
  testsPerOneMillion: {
    label: "tests per 1 million",
    color: "g",
  },
  recoveredPerOneMillion: {
    label: "recovered per 1 million",
    color: "g",
  },
  deathsPerOneMillion: {
    label: "deaths per 1 million",
    color: "r",
  },
};

export const defCat = "testsPerOneMillion";
export const defScaleVal = 160;
export const offsetStep = 25;
export const scaleStep = 20;
export const defCountryColor = "#CCC";
