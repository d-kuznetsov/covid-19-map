<template>
  <div class="App">
    <div class="App-container">
      <div class="App-header">
        <div class="App-countryData">
          <div
            v-for="item in curCountryItemsCfg"
            :key="item.label"
            class="App-countryDataItem"
          >
            <div>{{ item.label }}</div>
            <div v-if="curCountry?.[item.field]" :class="item.cssClasses">
              {{ curCountry[item.field] }}
            </div>
          </div>
        </div>
      </div>
      <div class="App-main">
        <select
          v-model="curCateg"
          class="App-categorySelect"
          :style="{ fontSize: '1.05rem' }"
        >
          <option
            v-for="({ label }, key) in categoryItemsCfg"
            :key="key"
            :value="key"
          >
            {{ label }}
          </option>
        </select>
        <div class="App-arrowUpWrap">
          <img
            class="App-arrowUp arrow"
            src="./assets/arrow-up.png"
            @click="moveUp"
          />
        </div>
        <div class="App-arrowRightWrap">
          <img
            class="App-arrowRight arrow"
            src="./assets/arrow-right.png"
            @click="moveRight"
          />
        </div>
        <div class="App-arrowLeftWrap">
          <img
            class="App-arrowLeft arrow"
            src="./assets/arrow-left.png"
            @click="moveLeft"
          />
        </div>
        <div class="App-arrowDownWrap">
          <img
            class="App-arrowDown arrow"
            src="./assets/arrow-down.png"
            @click="moveDown"
          />
        </div>
        <svg
          v-show="svgDims.width"
          :width="svgDims.width"
          :height="svgDims.height"
          class="App-svg"
        >
          <g class="App-svgMap"></g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref, watch } from "vue";
import { geoPath, select, json, scaleLinear } from "d3";
import { geoEquirectangular } from "d3-geo";
import geoJson from "./countries.geo.json";
import {
  coronaApi,
  curCountryItemsCfg,
  categoryItemsCfg,
  defScaleVal,
  defCat,
  offsetStep,
  scaleStep,
  defCountryColor,
} from "./config";
import throttle from "lodash.throttle";
import debounce from "lodash.debounce";

export default {
  setup() {
    const svgDims = reactive({
      width: 0,
      height: 0,
    });
    const offset = reactive({
      X: 0,
      Y: 0,
    });
    const scale = ref(defScaleVal);

    const curCateg = ref(defCat);
    const curCountry = ref(null);

    const maxValues = Object.keys(categoryItemsCfg).reduce((acc, field) => {
      return {
        ...acc,
        [field]: 0,
      };
    }, {});
    const covidData = {};

    const projection = geoEquirectangular();
    const geoGenerator = geoPath().projection(projection);
    geoGenerator.projection(projection);

    const moveUp = () => (offset.Y -= offsetStep);
    const moveDown = () => (offset.Y += offsetStep);
    const moveRight = () => (offset.X += offsetStep);
    const moveLeft = () => (offset.X -= offsetStep);

    const handleKeyDown = (e) => {
      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          moveUp();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDown();
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
      }
    };
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        scale.value -= scaleStep;
      } else if (e.deltaY < 0) {
        scale.value += scaleStep;
      }
    };
    const handleMouseOver = debounce((_, { properties }) => {
      curCountry.value = covidData[properties.name];
    }, 200);

    const update = throttle(() => {
      const colorScale = scaleLinear()
        .domain([0, maxValues[curCateg.value]])
        .range([100, 1000]);

      projection.scale(scale.value).translate([offset.X, offset.Y]);

      let u = select(".App-svgMap").selectAll("path").data(geoJson.features);
      u.enter()
        .append("path")
        .merge(u)
        .attr("d", geoGenerator)
        .on("mouseover", handleMouseOver)
        .style("fill", ({ properties: props }) => {
          let color = defCountryColor;
          if (covidData[props.name]) {
            const scaleVal = colorScale(covidData[props.name][curCateg.value]);
            switch (categoryItemsCfg[curCateg.value].color) {
              case "r":
                color = `rgb(${Math.floor(scaleVal)},50,50)`;
                break;
              case "g":
                color = `rgb(50,${Math.floor(scaleVal)},50)`;
                break;
            }
          }
          return color;
        })
        .append("svg:title")
        .text(({ properties }) => properties.name);
    }, 200);

    watch([offset, scale, curCateg], () => {
      update();
    });

    onMounted(() => {
      const w = document?.querySelector(".App-main")?.offsetWidth || 0;
      const h = w * (2 / 3);
      svgDims.width = w;
      svgDims.height = h;
      offset.X = w / 2;
      offset.Y = h / 2;

      document.querySelector(".App-svg").addEventListener("wheel", handleWheel);
      document.addEventListener("keydown", handleKeyDown);
      update();
    });

    json(coronaApi).then((data) => {
      data.forEach((v) => {
        covidData[v.country] = v;
        Object.keys(categoryItemsCfg).forEach((cat) => {
          if (v[cat] > maxValues[cat]) {
            maxValues[cat] = v[cat];
          }
        });
      });
    });

    return {
      curCountry,
      curCountryItemsCfg,
      svgDims,
      categoryItemsCfg,
      curCateg,
      moveUp,
      moveRight,
      moveDown,
      moveLeft,
    };
  },
};
</script>

<style>
body {
  margin: 0px;
  font-family: Arial, Helvetica, sans-serif;
}

.App {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(#7f1d1d, #000);
}

.App-container {
  width: 100%;
  max-width: 1024px;
}

.App-header {
  min-height: 110px;
  padding: 5px 0px;
  margin: 10px 0px;
}

.App-countryData {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
}

.App-countryDataItem {
  box-shadow: 0px 0px 10px rgb(252 211 77 / 50%);
  border-radius: 5px;
  padding: 5px;
  background: linear-gradient(135deg, #fcd34d, #f59e0b);
  min-height: 42px;
}

.App-countryDataItem > div {
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #312e81;
}

.App-countryDataItem > div:first-child {
  color: #111827;
  font-size: 1rem;
  font-weight: normal;
}

.App-main {
  position: relative;
  background: linear-gradient(0deg, #bfdbfe, #3b82f6);
  background: radial-gradient(#3b82f6, #60a5fa);
  border-radius: 7px;
  box-shadow: 0px 0px 10px rgb(252 211 77 / 50%);
}

.App-svg {
  position: relative;
}

.App-categorySelect {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 10;
}

.App-arrowUpWrap {
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.App-arrowRightWrap {
  position: absolute;
  top: 0;
  right: 5px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.App-arrowDownWrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  display: flex;
  justify-content: center;
}

.App-arrowLeftWrap {
  position: absolute;
  top: 0;
  left: 5px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.arrow {
  width: 32px;
  z-index: 10;
  cursor: pointer;
}
.text-green {
  color: #047857 !important;
}

.text-red {
  color: #b91c1c !important;
}
</style>
