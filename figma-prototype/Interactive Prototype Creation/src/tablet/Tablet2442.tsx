const assetPathPrefix = "/tablet-assets";
const imgDownload = `${assetPathPrefix}/c5315.svg`;
const imgSearch = `${assetPathPrefix}/ba8b6.svg`;
const imgBookmark = `${assetPathPrefix}/a7965.svg`;
const imgCheck = `${assetPathPrefix}/fbb49.svg`;
const imgArrowDown = `${assetPathPrefix}/7ce11.svg`;
const imgArrowDown1 = `${assetPathPrefix}/2a8cf.svg`;
const imgFilter = `${assetPathPrefix}/a1460.svg`;
const imgUtensilsCrossed = `${assetPathPrefix}/d6530.svg`;
const imgCalendar = `${assetPathPrefix}/c93d9.svg`;
const imgShoppingCart = `${assetPathPrefix}/44227.svg`;
const imgCar = `${assetPathPrefix}/fdd23.svg`;
const imgUser = `${assetPathPrefix}/c9a68.svg`;
const imgAmbulance = `${assetPathPrefix}/66113.svg`;
const imgRefreshCw = `${assetPathPrefix}/807f3.svg`;
const imgBolt = `${assetPathPrefix}/f2cdd.svg`;
const imgWallet2 = `${assetPathPrefix}/83bb8.svg`;
const imgDestinationIcon = `${assetPathPrefix}/ebd77.svg`;
const imgDestinationIcon1 = `${assetPathPrefix}/f20cf.svg`;
const imgDestinationIcon2 = `${assetPathPrefix}/6799f.svg`;
const imgDestinationIcon3 = `${assetPathPrefix}/78e1b.svg`;
const imgDestinationIcon4 = `${assetPathPrefix}/21722.svg`;

export default function Component06Transactions() {
  return (
    <div className="bg-[#fbfaf7] relative size-full" data-node-id="1:2442" data-name="06 · Transactions">
      <div className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[768px]" data-node-id="1:2443" data-name="content">
        <div className="content-stretch flex h-[64px] items-center justify-between px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="1:2444" data-name="top-bar">
          <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[22px] whitespace-nowrap" data-node-id="1:2445" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
          <div className="relative shrink-0 size-[24px]" data-node-id="1:2446" data-name="download">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDownload} />
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start px-[16px] py-[8px] relative shrink-0 w-full" data-node-id="1:2448" data-name="search-bar-container">
          <div className="bg-[#eceae4] content-stretch flex h-[48px] items-center justify-between px-[16px] relative rounded-[100px] shrink-0 w-full" data-node-id="1:2449" data-name="search-bar">
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-node-id="1:2450" data-name="Frame">
              <div className="relative shrink-0 size-[20px]" data-node-id="1:2451" data-name="search">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSearch} />
              </div>
              <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[14px] whitespace-nowrap" data-node-id="1:2453" style={{ fontVariationSettings: '"wdth" 100' }}>
                Merchant, amount, date or category
              </p>
            </div>
            <div className="relative shrink-0 size-[20px]" data-node-id="1:2454" data-name="bookmark">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBookmark} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-center px-[16px] py-[4px] relative shrink-0 w-full" data-node-id="1:2456" data-name="filter-chips">
          <div className="bg-[#1a1a18] content-stretch flex gap-[4px] h-[48px] items-center px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:2457" data-name="chip-date">
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2458" data-name="check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#fbfaf7] text-[13px] whitespace-nowrap" data-node-id="1:2460" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 1–18
            </p>
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2461" data-name="arrow-down">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowDown} />
            </div>
          </div>
          <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex gap-[4px] h-[48px] items-center px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:2463" data-name="chip-account">
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2464" style={{ fontVariationSettings: '"wdth" 100' }}>
              Account
            </p>
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2465" data-name="arrow-down">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowDown1} />
            </div>
          </div>
          <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex gap-[4px] h-[48px] items-center px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:2467" data-name="chip-category">
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2468" style={{ fontVariationSettings: '"wdth" 100' }}>
              Category
            </p>
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2469" data-name="arrow-down">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowDown1} />
            </div>
          </div>
          <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex gap-[4px] h-[48px] items-center px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:2471" data-name="chip-amount">
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2472" style={{ fontVariationSettings: '"wdth" 100' }}>
              Amount
            </p>
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2473" data-name="arrow-down">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowDown1} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between px-[24px] py-[8px] relative shrink-0 w-full" data-node-id="1:2475" data-name="summary-row">
          <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[13px] whitespace-nowrap" data-node-id="1:2476" style={{ fontVariationSettings: '"wdth" 100' }}>
            24 transactions · $2,462.05 spent
          </p>
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-node-id="1:2477" data-name="Frame">
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2478" data-name="filter">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilter} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2480" style={{ fontVariationSettings: '"wdth" 100' }}>
              Save filter
            </p>
          </div>
        </div>
        <div className="bg-[#cbc8c1] h-px relative shrink-0 w-[768px]" data-node-id="1:2481" data-name="Rectangle" />
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2482" data-name="group-today">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[12px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2483" data-name="date-header-today">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2484" style={{ fontVariationSettings: '"wdth" 100' }}>
              Today · Oct 18
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#4a4843]" data-node-id="1:2485" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$6.45
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="1:2486" data-name="card-today">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2487" data-name="card-inner">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2488" data-name="tx-juniper">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2489" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2490" data-name="utensils-crossed">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgUtensilsCrossed} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2492" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2493" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Juniper Coffee
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2494" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Food · Everyday Checking
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] items-end relative shrink-0" data-node-id="1:2495" data-name="Frame">
                  <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2496" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$6.45
                  </p>
                  <div className="content-stretch flex gap-[3px] items-center relative shrink-0" data-node-id="1:2497" data-name="Frame">
                    <div className="relative shrink-0 size-[12px]" data-node-id="1:2498" data-name="calendar">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCalendar} />
                    </div>
                    <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[11px] whitespace-nowrap" data-node-id="1:2500" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2501" data-name="group-oct17">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[16px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2502" data-name="date-header-oct17">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2503" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 17
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#4a4843]" data-node-id="1:2504" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$107.92
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="1:2505" data-name="card-oct17">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2506" data-name="card-inner-oct17">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2507" data-name="tx-freshfields">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2508" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2509" data-name="shopping-cart">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShoppingCart} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2511" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2512" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Fresh Fields Grocery
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2513" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Food · Platypus Credit Card
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2514" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$84.12
                </p>
              </div>
              <div className="bg-[#eceae4] h-px relative shrink-0 w-[736px]" data-node-id="1:2515" data-name="Rectangle" />
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2516" data-name="tx-cityride">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2517" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2518" data-name="car">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCar} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2520" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2521" style={{ fontVariationSettings: '"wdth" 100' }}>
                    CityRide
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2522" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Transportation · Platypus Credit Card
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2523" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$23.80
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2524" data-name="group-oct16">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[16px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2525" data-name="date-header-oct16">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2526" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 16
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#5a6300]" data-node-id="1:2527" style={{ fontVariationSettings: '"wdth" 100' }}>
              +$2,145.00
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="1:2528" data-name="card-oct16">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2529" data-name="card-inner-oct16">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2530" data-name="tx-ardent">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2531" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2532" data-name="user">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgUser} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2534" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2535" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Ardent Systems payroll
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2536" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Income · Everyday Checking
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#5a6300] text-[15px] whitespace-nowrap" data-node-id="1:2537" style={{ fontVariationSettings: '"wdth" 100' }}>
                  +$2,145.00
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2538" data-name="group-oct15">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[16px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2539" data-name="date-header-oct15">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2540" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 15
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#4a4843]" data-node-id="1:2541" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$40.00
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="1:2542" data-name="card-oct15">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2543" data-name="card-inner-oct15">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2544" data-name="tx-northline">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2545" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2546" data-name="ambulance">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAmbulance} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2548" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2549" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Northline Transit
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2550" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Transportation · Everyday Checking
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2551" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$40.00
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2552" data-name="group-oct14">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[16px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2553" data-name="date-header-oct14">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2554" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 14
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#4a4843]" data-node-id="1:2555" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$15.99
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="1:2556" data-name="card-oct14">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2557" data-name="card-inner-oct14">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2558" data-name="tx-streambox">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2559" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2560" data-name="refresh-cw">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRefreshCw} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2562" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2563" style={{ fontVariationSettings: '"wdth" 100' }}>
                    StreamBox
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2564" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Subscriptions · Platypus Credit Card
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2565" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$15.99
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2566" data-name="group-oct12">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[16px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2567" data-name="date-header-oct12">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2568" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 12
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#4a4843]" data-node-id="1:2569" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$103.05
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="1:2570" data-name="card-oct12">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2571" data-name="card-inner-oct12">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2572" data-name="tx-harbor">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2573" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2574" data-name="bolt">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBolt} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2576" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2577" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Harbor Electric
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2578" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Utilities · Everyday Checking
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2579" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$84.30
                </p>
              </div>
              <div className="bg-[#eceae4] h-px relative shrink-0 w-[736px]" data-node-id="1:2580" data-name="Rectangle" />
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2581" data-name="tx-tacolab">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2582" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2583" data-name="utensils-crossed">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgUtensilsCrossed} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2585" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2586" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Taco Lab
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2587" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Food · Platypus Credit Card
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2588" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$18.75
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2589" data-name="group-oct10">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] pb-[4px] pt-[16px] px-[24px] relative shrink-0 text-[13px] w-full whitespace-nowrap" data-node-id="1:2590" data-name="date-header-oct10">
            <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[#1a1a1a]" data-node-id="1:2591" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 10
            </p>
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#4a4843]" data-node-id="1:2592" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$300.00
            </p>
          </div>
          <div className="content-stretch flex flex-col items-start pb-[8px] px-[16px] relative shrink-0 w-full" data-node-id="1:2593" data-name="card-oct10">
            <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="1:2594" data-name="card-inner-oct10">
              <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:2595" data-name="tx-savings">
                <div className="bg-[#eceae4] content-stretch flex flex-col items-center justify-center relative rounded-[100px] shrink-0 size-[44px]" data-node-id="1:2596" data-name="icon-container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:2597" data-name="wallet-2">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWallet2} />
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="1:2599" data-name="Frame">
                  <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2600" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Transfer to Rainy Day Savings
                  </p>
                  <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:2601" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Savings · Everyday Checking
                  </p>
                </div>
                <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] whitespace-nowrap" data-node-id="1:2602" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$300.00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)] top-[1047px] w-[768px]" data-node-id="1:2603" data-name="nav-bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:2603;24:1665" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:2603;24:1666" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:2603;24:1667" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:2603;24:1669">
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:2603;24:1670" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:2603;24:1671" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:2603;24:1672" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:2603;24:1674">
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:2603;24:1675" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:2603;24:1676" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:2603;24:1677" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:2603;24:1679" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:2603;24:1680" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:2603;24:1681" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:2603;24:1682" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:2603;24:1684" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:2603;24:1685" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:2603;24:1686" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:2603;24:1687" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon4} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:2603;24:1689" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}