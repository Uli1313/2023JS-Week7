import * as d3 from "d3";
import * as c3 from "c3";
import axios, { isCancel, AxiosError } from "axios";

let data;
let url =
  "https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json";

const ticketCardArea = document.querySelector(".ticketCard-area");
const searchResultText = document.querySelector("#searchResult-text");
const regionSearch = document.querySelector(".regionSearch");
const addTicketBtn = document.querySelector(".addTicket-btn");
const addTicketForm = document.querySelector(".addTicket-form");

axios
  .get(url)
  .then((res) => {
    data = res.data.data;
    render(data);
  })
  .catch((err) => {
    console.log(err);
  });

// 顯示套票列表
function render(data) {
  let str = "";
  data.forEach((e) => {
    str += `<li class="ticketCard">
      <div class="ticketCard-img">
        <a href="#">
          <img
            src=${e.imgUrl}
            alt=""
          />
        </a>
        <div class="ticketCard-region">${e.area}</div>
        <div class="ticketCard-rank">${e.rate}</div>
      </div>
      <div class="ticketCard-content">
        <div>
          <h3>
            <a href="#" class="ticketCard-name">${e.name}</a>
          </h3>
          <p class="ticketCard-description">
          ${e.description}
          </p>
        </div>
        <div class="ticketCard-info">
          <p class="ticketCard-num">
            <span><i class="fas fa-exclamation-circle"></i></span>
            剩下最後 <span id="ticketCard-num"> ${e.group} </span> 組
          </p>
          <p class="ticketCard-price">
            TWD <span id="ticketCard-price">${e.price}</span>
          </p>
        </div>
      </div>
    </li>`;
  });
  ticketCardArea.innerHTML = str;
  searchResultText.textContent = `本次搜尋共 ${data.length} 筆資料`;

  // 圖表資料
  const newData = [];
  // 整理資料1 - 計算各地區次數
  const donutDataObj = data.reduce((obj, c) => {
    obj[c.area] ? obj[c.area]++ : (obj[c.area] = 1);
    return obj;
  }, {});
  // 整理資料2 - 轉成 C3 要的格式
  const donutDataArr = Object.keys(donutDataObj);
  donutDataArr.forEach((e) => {
    const arr = [];
    arr.push(e, donutDataObj[e]);
    newData.push(arr);
  });
  // 整理資料3 - 依全台縣市排序
  const countiesOrder = [
    "基隆",
    "台北",
    "新北",
    "桃園",
    "新竹",
    "苗栗",
    "台中",
    "彰化",
    "南投",
    "雲林",
    "嘉義",
    "台南",
    "高雄",
    "屏東",
    "宜蘭",
    "花蓮",
    "台東",
    "澎湖",
    "金門",
    "連江",
  ];
  newData.sort(
    (a, b) => countiesOrder.indexOf(a[0]) - countiesOrder.indexOf(b[0])
  );

  // 繪製圖表
  var chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: newData,
      type: "donut",
      colors: {
        台北: "#26C0C7",
        台中: "#5151D3",
        高雄: "#E68618",
      },
    },
    donut: {
      title: "套票地區比重",
      label: {
        // 顯示/隱藏環上每一項的標籤
        show: false,
      },
      // 環的寬度
      width: 10,
    },
    size: {
      height: 160,
    },
  });
}

// 依篩選條件顯示套票
function filter() {
  if (regionSearch.value === "" || regionSearch.value === "地區搜尋") {
    render(data);
    return;
  }
  const filterArea = data.filter((e) => e.area === regionSearch.value);
  render(filterArea);
}

// 下方套票列表篩選
regionSearch.addEventListener("change", () => {
  filter();
});

// 上方新增套票
addTicketBtn.addEventListener("click", () => {
  // 獲得使用者輸入的值
  const ticketValues = [];
  ticketValues.push(
    document.querySelector("#ticketName").value,
    document.querySelector("#ticketImgUrl").value,
    document.querySelector("#ticketRegion").value,
    document.querySelector("#ticketDescription").value,
    document.querySelector("#ticketNum").value,
    document.querySelector("#ticketPrice").value,
    document.querySelector("#ticketRate").value
  );

  // 產生要存入 data 的物件
  const ticketData = {};
  const dataKeys = Object.keys(data[0]).splice(1);

  // 產生 id
  let id;
  if (data.length === 0) {
    id = 1;
  } else {
    id = data[data.length - 1].id + 1;
  }
  ticketData.id = id;

  // 產生其他資料
  dataKeys.forEach((e, i) => (ticketData[e] = ticketValues[i]));
  data.push(ticketData);

  // 維持原本篩選條件顯示套票
  filter();

  // 清空輸入值
  addTicketForm.reset();
});
