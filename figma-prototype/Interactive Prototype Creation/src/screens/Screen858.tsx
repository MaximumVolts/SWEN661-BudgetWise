const assetPathPrefix = "/assets";
const imgSignal = `${assetPathPrefix}/fe9b0.svg`;
const imgWiFi = `${assetPathPrefix}/fda9d.svg`;
const imgBattery = `${assetPathPrefix}/96e48.svg`;
const imgTrailingIcon = `${assetPathPrefix}/90f12.svg`;
const imgChipIcon = `${assetPathPrefix}/38745.svg`;
const imgChipIcon1 = `${assetPathPrefix}/f1a3d.svg`;
const imgTransactionIcon = `${assetPathPrefix}/cc75c.svg`;
const imgTransactionIcon1 = `${assetPathPrefix}/0ffba.svg`;
const imgTransactionIcon2 = `${assetPathPrefix}/e9222.svg`;
const imgTransactionIcon3 = `${assetPathPrefix}/d5f16.svg`;
const imgDestinationIcon = `${assetPathPrefix}/ebd77.svg`;
const imgDestinationIcon1 = `${assetPathPrefix}/f20cf.svg`;
const imgDestinationIcon2 = `${assetPathPrefix}/6799f.svg`;
const imgDestinationIcon3 = `${assetPathPrefix}/78e1b.svg`;
const imgDestinationIcon4 = `${assetPathPrefix}/21722.svg`;

export default function Component06Transactions() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start pb-[146px] relative size-full" data-node-id="1:858" data-name="06 · Transactions">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-[390px]" data-node-id="1:859" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:860" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:861" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:862" data-name="Signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:864" data-name="Wi-Fi">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFi} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:866" data-name="Battery">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col h-[816px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:868" data-name="Screen content">
        <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:869" data-name="Top app bar">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:870" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
          <div className="relative shrink-0 size-[24px]" data-node-id="1:871" data-name="Trailing icon">
            <div className="absolute inset-[0_20%_20%_0]">
              <img alt="" className="block max-w-none size-full" src={imgTrailingIcon} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[14px] items-start overflow-clip pb-[12px] pt-[4px] px-[16px] relative shrink-0 w-full" data-node-id="1:872" data-name="Page content">
          <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:873" data-name="Filters">
            <div className="bg-[#1a1a1a] border border-[#1a1a1a] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:874" data-name="Filter chip">
              <div className="relative shrink-0 size-[17px]" data-node-id="1:875" data-name="Chip icon">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon} />
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:877" style={{ fontVariationSettings: '"wdth" 100' }}>
                All accounts
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:878" data-name="Filter chip">
              <div className="relative shrink-0 size-[17px]" data-node-id="1:879" data-name="Chip icon">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon1} />
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:881" style={{ fontVariationSettings: '"wdth" 100' }}>
                Category
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:882" data-name="Filter chip">
              <div className="relative shrink-0 size-[17px]" data-node-id="1:883" data-name="Chip icon">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon1} />
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:885" style={{ fontVariationSettings: '"wdth" 100' }}>
                Date
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:886" data-name="Transaction list">
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:887" data-name="Day group">
              <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:888" data-name="Date summary">
                <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:889" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Oct 16
                </p>
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:890" style={{ fontVariationSettings: '"wdth" 100' }}>
                  +$2,145.00
                </p>
              </div>
              <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[8px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:891" data-name="Transaction card">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:892" data-name="List item">
                  <div className="bg-[#e4ee6a] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:893" data-name="Icon container">
                    <div className="relative shrink-0 size-[22px]" data-node-id="1:894" data-name="Transaction icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTransactionIcon} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:896" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:897" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Ardent Systems payroll
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:898" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Income · Everyday Checking
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:899" style={{ fontVariationSettings: '"wdth" 100' }}>
                    +$2,145.00
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:900" data-name="Day group">
              <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:901" data-name="Date summary">
                <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:902" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Oct 15
                </p>
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:903" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$40.00
                </p>
              </div>
              <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[8px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:904" data-name="Transaction card">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:905" data-name="List item">
                  <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:906" data-name="Icon container">
                    <div className="overflow-clip relative shrink-0 size-[22px]" data-node-id="1:907" data-name="Transaction icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTransactionIcon1} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:910" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:911" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Northline Transit
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:912" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Transportation · Everyday Checking
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:913" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$40.00
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:914" data-name="Day group">
              <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:915" data-name="Date summary">
                <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:916" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Oct 14
                </p>
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:917" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$15.99
                </p>
              </div>
              <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[8px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:918" data-name="Transaction card">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:919" data-name="List item">
                  <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:920" data-name="Icon container">
                    <div className="relative shrink-0 size-[22px]" data-node-id="1:921" data-name="Transaction icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTransactionIcon2} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:923" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:924" style={{ fontVariationSettings: '"wdth" 100' }}>
                      StreamBox
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:925" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Subscriptions · Platypus Card
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:926" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$15.99
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:927" data-name="Day group">
              <div className="[word-break:break-word] content-stretch flex items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:928" data-name="Date summary">
                <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:929" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Oct 13
                </p>
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:930" style={{ fontVariationSettings: '"wdth" 100' }}>
                  −$82.40
                </p>
              </div>
              <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[8px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:931" data-name="Transaction card">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:932" data-name="List item">
                  <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:933" data-name="Icon container">
                    <div className="overflow-clip relative shrink-0 size-[22px]" data-node-id="1:934" data-name="Transaction icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTransactionIcon3} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:937" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:938" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Greenmarket Grocery
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:939" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Food · Platypus Card
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:940" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$82.40
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t bottom-0 content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] right-0 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]" data-node-id="1:941" data-name="Navigation bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:941;24:1665" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:941;24:1666" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:941;24:1667" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:941;24:1669" style={{ fontVariationSettings: '"wdth" 100' }}>
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:941;24:1670" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:941;24:1671" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:941;24:1672" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:941;24:1674" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:941;24:1675" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:941;24:1676" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:941;24:1677" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:941;24:1679" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:941;24:1680" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:941;24:1681" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:941;24:1682" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:941;24:1684" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:941;24:1685" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:941;24:1686" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:941;24:1687" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon4} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:941;24:1689" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}