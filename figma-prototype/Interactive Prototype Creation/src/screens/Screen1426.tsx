const assetPathPrefix = "/assets";
const imgGridLine4K = `${assetPathPrefix}/4cf15.png`;
const imgArrowLeft = `${assetPathPrefix}/4a0d3.svg`;
const imgCheck = `${assetPathPrefix}/6336f.svg`;
const imgTrendingDown = `${assetPathPrefix}/c3f75.svg`;
const imgGridLine2K = `${assetPathPrefix}/f2126.svg`;
const imgChartLine = `${assetPathPrefix}/030d6.svg`;
const imgLowPoint = `${assetPathPrefix}/82d59.svg`;
const imgEndDot = `${assetPathPrefix}/62cd7.svg`;
const imgDiv0 = `${assetPathPrefix}/d9fbd.svg`;
const imgDivSpacer1 = `${assetPathPrefix}/c7195.svg`;
const imgPlus = `${assetPathPrefix}/15387.svg`;
const imgDestinationIcon = `${assetPathPrefix}/2a59c.svg`;
const imgDestinationIcon1 = `${assetPathPrefix}/9e99e.svg`;
const imgDestinationIcon2 = `${assetPathPrefix}/6799f.svg`;
const imgDestinationIcon3 = `${assetPathPrefix}/78e1b.svg`;
const imgDestinationIcon4 = `${assetPathPrefix}/21722.svg`;

export default function Component16CashFlowProjection() {
  return (
    <div className="bg-[#fbfaf7] relative size-full" data-node-id="1:1426" data-name="16 · Cash Flow Projection">
      <div className="absolute content-stretch flex gap-[8px] items-center left-0 pl-[8px] pr-[16px] py-[16px] top-0 w-[390px]" data-node-id="1:1427" data-name="TopAppBar">
        <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[48px]" data-node-id="1:1428" data-name="BackButton">
          <div className="relative shrink-0 size-[24px]" data-node-id="1:1429" data-name="arrow-left">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
          </div>
        </div>
        <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[28px] relative shrink-0 text-[#1a1a1a] text-[22px] whitespace-nowrap" data-node-id="1:1431" style={{ fontVariationSettings: '"wdth" 100' }}>
          Cash Flow Projection
        </p>
      </div>
      <div className="absolute border border-[#7a7872] border-solid content-stretch flex h-[40px] items-start left-[16px] overflow-clip rounded-[100px] top-[72px]" data-node-id="1:1432" data-name="SegmentedButtons">
        <div className="bg-[#e4ee6a] border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[40px] items-center px-[16px] py-[10px] relative shrink-0" data-node-id="1:1433" data-name="Seg30">
          <div className="relative shrink-0 size-[18px]" data-node-id="1:1434" data-name="check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[20px] relative shrink-0 text-[#2b2e00] text-[14px] whitespace-nowrap" data-node-id="1:1436" style={{ fontVariationSettings: '"wdth" 100' }}>
            30 days
          </p>
        </div>
        <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex h-[40px] items-center px-[24px] py-[10px] relative shrink-0" data-node-id="1:1437" data-name="Seg60">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[20px] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1438" style={{ fontVariationSettings: '"wdth" 100' }}>
            60 days
          </p>
        </div>
        <div className="bg-[#fbfaf7] content-stretch flex h-[40px] items-center px-[24px] py-[10px] relative shrink-0" data-node-id="1:1439" data-name="Seg90">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[20px] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1440" style={{ fontVariationSettings: '"wdth" 100' }}>
            90 days
          </p>
        </div>
      </div>
      <div className="absolute content-stretch flex gap-[8px] items-center left-[16px] top-[128px]" data-node-id="1:1441" data-name="IncomeFilter">
        <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[14px] whitespace-nowrap" data-node-id="1:1442" style={{ fontVariationSettings: '"wdth" 100' }}>
          Income
        </p>
        <div className="bg-[#fbfaf7] border border-[#cbc8c1] border-solid content-stretch flex h-[32px] items-center px-[16px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="1:1443" data-name="FilterLow">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1444" style={{ fontVariationSettings: '"wdth" 100' }}>
            Low
          </p>
        </div>
        <div className="bg-[#e4ee6a] border border-[#cbc8c1] border-solid content-stretch flex gap-[6px] h-[32px] items-center pl-[12px] pr-[16px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="1:1445" data-name="FilterExpected">
          <div className="relative shrink-0 size-[18px]" data-node-id="1:1446" data-name="check">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#2b2e00] text-[14px] whitespace-nowrap" data-node-id="1:1448" style={{ fontVariationSettings: '"wdth" 100' }}>
            Expected
          </p>
        </div>
        <div className="bg-[#fbfaf7] border border-[#cbc8c1] border-solid content-stretch flex h-[32px] items-center px-[16px] py-[6px] relative rounded-[100px] shrink-0" data-node-id="1:1449" data-name="FilterHigh">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1450" style={{ fontVariationSettings: '"wdth" 100' }}>
            High
          </p>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-[16px] top-[180px] w-[358px]" data-node-id="1:1451" data-name="ProjectedCashHeader">
        <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[16px] relative shrink-0 text-[#4a4843] text-[12px] whitespace-nowrap" data-node-id="1:1452" style={{ fontVariationSettings: '"wdth" 100' }}>
          Projected cash on Nov 17
        </p>
        <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[48px] relative shrink-0 text-[#1a1a1a] text-[40px] whitespace-nowrap" data-node-id="1:1453" style={{ fontVariationSettings: '"wdth" 100' }}>
          $4,034.08
        </p>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-[358px]" data-node-id="1:1454" data-name="LowestPointRow">
          <div className="relative shrink-0 size-[20px]" data-node-id="1:1455" data-name="trending-down">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTrendingDown} />
          </div>
          <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[0] relative shrink-0 text-[#4a4843] text-[0px] w-[330px]" data-node-id="1:1457" style={{ fontVariationSettings: '"wdth" 100' }}>
            <span className="font-['Roboto:Medium'] font-medium leading-[24px] text-[16px]" style={{ fontVariationSettings: '"wdth" 100' }}>
              Lowest point: $2,494.05
            </span>
            <span className="leading-[24px] text-[16px]">{` around Oct 25, after your card payment`}</span>
          </p>
        </div>
      </div>
      <div className="absolute bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start left-[16px] overflow-clip rounded-[16px] top-[296px] w-[358px]" data-node-id="1:1458" data-name="ChartCard">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative shrink-0 w-[358px]" data-node-id="1:1459" data-name="ChartCardInner">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1460" style={{ fontVariationSettings: '"wdth" 100' }}>
            Cash over the next 30 days
          </p>
          <div className="h-[180px] relative shrink-0 w-[326px]" data-node-id="1:1461" data-name="ChartArea">
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-0 text-[#4a4843] text-[10px] top-[4px] whitespace-nowrap" data-node-id="1:1462" style={{ fontVariationSettings: '"wdth" 100' }}>
              $4k
            </p>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-0 text-[#4a4843] text-[10px] top-[60px] whitespace-nowrap" data-node-id="1:1463" style={{ fontVariationSettings: '"wdth" 100' }}>
              $3k
            </p>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-0 text-[#4a4843] text-[10px] top-[116px] whitespace-nowrap" data-node-id="1:1464" style={{ fontVariationSettings: '"wdth" 100' }}>
              $2k
            </p>
            <div className="absolute h-0 left-[28px] top-[14px] w-[290px]" data-node-id="1:1465" data-name="GridLine4k">
              <div className="absolute inset-[-1px_0_0_0]">
                <img alt="" className="block max-w-none size-full" height="1" src={imgGridLine4K} width="290" />
              </div>
            </div>
            <div className="absolute h-0 left-[28px] top-[70px] w-[290px]" data-node-id="1:1466" data-name="GridLineMid">
              <div className="absolute inset-[-1px_0_0_0]">
                <img alt="" className="block max-w-none size-full" height="1" src={imgGridLine4K} width="290" />
              </div>
            </div>
            <div className="absolute h-0 left-[28px] top-[126px] w-[290px]" data-node-id="1:1467" data-name="GridLine2k">
              <div className="absolute inset-[-1px_0_0_0]">
                <img alt="" className="block max-w-none size-full" src={imgGridLine2K} />
              </div>
            </div>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[22px] text-[#4a4843] text-[10px] top-[160px] whitespace-nowrap" data-node-id="1:1468" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 18
            </p>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[70px] text-[#4a4843] text-[10px] top-[160px] whitespace-nowrap" data-node-id="1:1469" style={{ fontVariationSettings: '"wdth" 100' }}>
              Oct 25
            </p>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[124px] text-[#4a4843] text-[10px] top-[160px] whitespace-nowrap" data-node-id="1:1470" style={{ fontVariationSettings: '"wdth" 100' }}>
              Nov 1
            </p>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[172px] text-[#4a4843] text-[10px] top-[160px] whitespace-nowrap" data-node-id="1:1471" style={{ fontVariationSettings: '"wdth" 100' }}>
              Nov 8
            </p>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[218px] text-[#4a4843] text-[10px] top-[160px] whitespace-nowrap" data-node-id="1:1472" style={{ fontVariationSettings: '"wdth" 100' }}>
              Nov 15
            </p>
            <div className="absolute h-[140px] left-[28px] top-[14px] w-[290px]" data-node-id="1:1473" data-name="chart-line">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChartLine} />
            </div>
            <div className="absolute left-[71px] size-[10px] top-[113px]" data-node-id="1:1475" data-name="LowPoint">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLowPoint} />
            </div>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[54px] text-[#4a4843] text-[10px] top-[128px] whitespace-nowrap" data-node-id="1:1476" style={{ fontVariationSettings: '"wdth" 100' }}>
              Low $2,494
            </p>
            <div className="absolute left-[277px] size-[8px] top-[14px]" data-node-id="1:1477" data-name="EndDot">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEndDot} />
            </div>
            <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[normal] left-[252px] text-[#1a1a1a] text-[10px] top-[4px] whitespace-nowrap" data-node-id="1:1478" style={{ fontVariationSettings: '"wdth" 100' }}>
              $4,034
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start left-[16px] overflow-clip rounded-[16px] top-[548px] w-[358px]" data-node-id="1:1479" data-name="BreakdownCard">
        <div className="content-stretch flex flex-col items-start pb-[12px] pt-[16px] px-[16px] relative shrink-0 w-[358px]" data-node-id="1:1480" data-name="BreakdownHeader">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1481" style={{ fontVariationSettings: '"wdth" 100' }}>
            How we got this
          </p>
        </div>
        <div className="h-0 relative shrink-0 w-[358px]" data-node-id="1:1482" data-name="Div0">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgDiv0} />
          </div>
        </div>
        <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] pb-[4px] pt-[12px] px-[16px] relative shrink-0 w-[358px] whitespace-nowrap" data-node-id="1:1483" data-name="RowCashToday">
          <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[200px]" data-node-id="1:1484" data-name="Frame">
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1485" style={{ fontVariationSettings: '"wdth" 100' }}>
              Cash today
            </p>
            <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:1486" style={{ fontVariationSettings: '"wdth" 100' }}>
              Everyday Checking
            </p>
          </div>
          <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1487" style={{ fontVariationSettings: '"wdth" 100' }}>
            $3,248.60
          </p>
        </div>
        <div className="h-[12px] relative shrink-0 w-[358px]" data-node-id="1:1488" data-name="DivSpacer1">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDivSpacer1} />
        </div>
        <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] pb-[4px] pt-[12px] px-[16px] relative shrink-0 w-[358px] whitespace-nowrap" data-node-id="1:1490" data-name="RowExpectedIncome">
          <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[220px]" data-node-id="1:1491" data-name="Frame">
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1492" style={{ fontVariationSettings: '"wdth" 100' }}>
              Expected income
            </p>
            <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:1493" style={{ fontVariationSettings: '"wdth" 100' }}>
              Ardent Systems payroll · Oct 30, Nov 13
            </p>
          </div>
          <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#5a6300] text-[14px]" data-node-id="1:1494" style={{ fontVariationSettings: '"wdth" 100' }}>
            +$4,290.00
          </p>
        </div>
        <div className="h-[12px] relative shrink-0 w-[358px]" data-node-id="1:1495" data-name="DivSpacer2">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDivSpacer1} />
        </div>
        <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] pb-[4px] pt-[12px] px-[16px] relative shrink-0 w-[358px] whitespace-nowrap" data-node-id="1:1497" data-name="RowBills">
          <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[200px]" data-node-id="1:1498" data-name="Frame">
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1499" style={{ fontVariationSettings: '"wdth" 100' }}>{`Bills & recurring`}</p>
            <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:1500" style={{ fontVariationSettings: '"wdth" 100' }}>
              9 payments incl. rent on Nov 1
            </p>
          </div>
          <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#b3261e] text-[14px]" data-node-id="1:1501" style={{ fontVariationSettings: '"wdth" 100' }}>
            -$2,154.52
          </p>
        </div>
        <div className="h-[12px] relative shrink-0 w-[358px]" data-node-id="1:1502" data-name="DivSpacer3">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDivSpacer1} />
        </div>
        <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] pb-[4px] pt-[12px] px-[16px] relative shrink-0 w-[358px] whitespace-nowrap" data-node-id="1:1504" data-name="RowSavings">
          <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[200px]" data-node-id="1:1505" data-name="Frame">
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1506" style={{ fontVariationSettings: '"wdth" 100' }}>
              Planned savings
            </p>
            <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:1507" style={{ fontVariationSettings: '"wdth" 100' }}>
              Emergency fund · Nov 10
            </p>
          </div>
          <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#b3261e] text-[14px]" data-node-id="1:1508" style={{ fontVariationSettings: '"wdth" 100' }}>
            -$300.00
          </p>
        </div>
        <div className="h-[12px] relative shrink-0 w-[358px]" data-node-id="1:1509" data-name="DivSpacer4">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDivSpacer1} />
        </div>
        <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] px-[16px] py-[12px] relative shrink-0 w-[358px] whitespace-nowrap" data-node-id="1:1511" data-name="RowSpending">
          <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-[200px]" data-node-id="1:1512" data-name="Frame">
            <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1513" style={{ fontVariationSettings: '"wdth" 100' }}>
              Everyday spending
            </p>
            <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[12px]" data-node-id="1:1514" style={{ fontVariationSettings: '"wdth" 100' }}>
              Your 3-month average
            </p>
          </div>
          <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#b3261e] text-[14px]" data-node-id="1:1515" style={{ fontVariationSettings: '"wdth" 100' }}>
            -$1,050.00
          </p>
        </div>
        <div className="h-0 relative shrink-0 w-[358px]" data-node-id="1:1516" data-name="Div5">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgDiv0} />
          </div>
        </div>
        <div className="[word-break:break-word] bg-[#f5f5f0] content-stretch flex font-['Roboto:Bold'] font-bold items-center justify-between leading-[normal] px-[16px] py-[14px] relative shrink-0 text-[#1a1a1a] text-[14px] w-[358px] whitespace-nowrap" data-node-id="1:1517" data-name="RowProjectedTotal">
          <p className="relative shrink-0" data-node-id="1:1518" style={{ fontVariationSettings: '"wdth" 100' }}>
            Projected cash
          </p>
          <p className="relative shrink-0" data-node-id="1:1519" style={{ fontVariationSettings: '"wdth" 100' }}>
            $4,034.08
          </p>
        </div>
      </div>
      <div className="absolute bg-[#fbfaf7] border border-[#1a1a18] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center left-[16px] rounded-[100px] top-[944px] w-[358px]" data-node-id="1:1520" data-name="AddIncomeButton">
        <div className="relative shrink-0 size-[18px]" data-node-id="1:1521" data-name="plus">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlus} />
        </div>
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] tracking-[0.1px] whitespace-nowrap" data-node-id="1:1523" style={{ fontVariationSettings: '"wdth" 100' }}>
          Add expected income
        </p>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t bottom-0 content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] right-0 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]" data-node-id="1:1524" data-name="Navigation bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:1524;24:1639" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:1524;24:1640" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:1524;24:1641" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:1524;24:1643" style={{ fontVariationSettings: '"wdth" 100' }}>
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:1524;24:1644" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:1524;24:1645" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:1524;24:1646" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:1524;24:1648" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:1524;24:1649" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:1524;24:1650" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:1524;24:1651" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:1524;24:1653" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:1524;24:1654" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:1524;24:1655" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:1524;24:1656" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:1524;24:1658" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:1524;24:1659" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:1524;24:1660" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:1524;24:1661" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon4} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:1524;24:1663" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}