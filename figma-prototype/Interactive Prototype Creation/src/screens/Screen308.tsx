const assetPathPrefix = "/assets";
const imgSignal = `${assetPathPrefix}/41589.svg`;
const imgWiFi = `${assetPathPrefix}/e7f71.svg`;
const imgBattery = `${assetPathPrefix}/e1cdb.svg`;
const imgTrailingIcon = `${assetPathPrefix}/629c4.svg`;
const imgIcon = `${assetPathPrefix}/2dda1.svg`;
const imgRowSeparation = `${assetPathPrefix}/c39d8.svg`;
const imgIcon1 = `${assetPathPrefix}/cb92f.svg`;
const imgIcon2 = `${assetPathPrefix}/0a9aa.svg`;
const imgIcon3 = `${assetPathPrefix}/b351c.svg`;
const imgIcon4 = `${assetPathPrefix}/fb31c.svg`;
const imgDestinationIcon = `${assetPathPrefix}/ebd77.svg`;
const imgDestinationIcon1 = `${assetPathPrefix}/9e99e.svg`;
const imgIcon5 = `${assetPathPrefix}/62de4.svg`;
const imgDestinationIcon2 = `${assetPathPrefix}/78e1b.svg`;
const imgDestinationIcon3 = `${assetPathPrefix}/21722.svg`;

export default function Component10SpendingTrends() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:308" data-name="10 · Spending & Trends">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:309" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:310" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:311" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:312" data-name="Signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:314" data-name="Wi-Fi">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFi} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:316" data-name="Battery">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:318" data-name="Screen content">
        <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:319" data-name="Top app bar">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:320" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
          <div className="relative shrink-0 size-[24px]" data-node-id="1:321" data-name="Trailing icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTrailingIcon} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip pb-[24px] pt-[8px] px-[16px] relative shrink-0 w-full" data-node-id="1:323" data-name="Page content">
          <div className="content-stretch flex h-[42px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:324" data-name="Segmented button">
            <div className="bg-[#eceae4] border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative rounded-bl-[100px] rounded-tl-[100px]" data-node-id="1:325" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:326" style={{ fontVariationSettings: '"wdth" 100' }}>
                Month
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative" data-node-id="1:327" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:328" style={{ fontVariationSettings: '"wdth" 100' }}>
                3 months
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative rounded-br-[100px] rounded-tr-[100px]" data-node-id="1:329" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:330" style={{ fontVariationSettings: '"wdth" 100' }}>
                Year
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:331" data-name="Spending chart">
            <div className="[word-break:break-word] content-stretch flex items-end justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:332" data-name="Spending summary">
              <div className="content-stretch flex flex-col gap-[3px] items-start overflow-clip relative shrink-0" data-node-id="1:333" data-name="Total spent">
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:334" style={{ fontVariationSettings: '"wdth" 100' }}>
                  October spending
                </p>
                <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[30px]" data-node-id="1:335" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $1,083.42
                </p>
              </div>
              <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:336" style={{ fontVariationSettings: '"wdth" 100' }}>
                ▲ 14.8%
              </p>
            </div>
            <div className="content-stretch flex h-[116px] items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:337" data-name="Bar chart">
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[54px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:338" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[78px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:339" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[45px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:340" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[92px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:341" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[70px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:342" data-name="Daily spend" />
              <div className="bg-[#e4ee6a] border-2 border-[#5a6300] border-dashed h-[104px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:343" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[84px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:344" data-name="Daily spend" />
            </div>
            <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 text-[#4a4843] text-[11px] w-full whitespace-nowrap" data-node-id="1:345" data-name="Chart labels">
              <p className="relative shrink-0" data-node-id="1:346" style={{ fontVariationSettings: '"wdth" 100' }}>
                1
              </p>
              <p className="relative shrink-0" data-node-id="1:347" style={{ fontVariationSettings: '"wdth" 100' }}>
                5
              </p>
              <p className="relative shrink-0" data-node-id="1:348" style={{ fontVariationSettings: '"wdth" 100' }}>
                10
              </p>
              <p className="relative shrink-0" data-node-id="1:349" style={{ fontVariationSettings: '"wdth" 100' }}>
                15
              </p>
              <p className="relative shrink-0" data-node-id="1:350" style={{ fontVariationSettings: '"wdth" 100' }}>
                20
              </p>
              <p className="relative shrink-0" data-node-id="1:351" style={{ fontVariationSettings: '"wdth" 100' }}>
                25
              </p>
              <p className="relative shrink-0" data-node-id="1:352" style={{ fontVariationSettings: '"wdth" 100' }}>
                31
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:353" data-name="Category breakdown">
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:354" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:355" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:356" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:357" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:359" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Food
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:360" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $362.18
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:361" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 22.1%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:362" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[46px]" data-node-id="1:363" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:364" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:366" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:367" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:368" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:369" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:371" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Savings
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:372" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $300.00
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:373" style={{ fontVariationSettings: '"wdth" 100' }}>
                  No change
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:374" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[38px]" data-node-id="1:375" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:376" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:378" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:379" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:380" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:381" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon2} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:383" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Transportation
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:384" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $148.60
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:385" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 54.5%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:386" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[19px]" data-node-id="1:387" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:388" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:390" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:391" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:392" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:393" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon3} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:395" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Utilities
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:396" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $84.30
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:397" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 17.2%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:398" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[12px]" data-node-id="1:399" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:400" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:402" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:403" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:404" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:405" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon4} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:407" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Subscriptions
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:408" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $31.97
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:409" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 89.2%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:410" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[12px]" data-node-id="1:411" data-name="Progress" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t bottom-0 content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] right-0 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]" data-node-id="1:412" data-name="Navigation bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:412;24:1691" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:412;24:1692" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:412;24:1693" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:412;24:1695" style={{ fontVariationSettings: '"wdth" 100' }}>
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:412;24:1696" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:412;24:1697" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:412;24:1698" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:412;24:1700" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:412;24:1701" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:412;24:1702" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:412;24:1703" data-name="Icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon5} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:412;24:1705" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:412;24:1706" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:412;24:1707" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:412;24:1708" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:412;24:1710" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:412;24:1711" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:412;24:1712" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:412;24:1713" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:412;24:1715" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}