const assetPathPrefix = "/assets";
const imgSignal = `${assetPathPrefix}/fe9b0.svg`;
const imgWiFi = `${assetPathPrefix}/fda9d.svg`;
const imgBattery = `${assetPathPrefix}/96e48.svg`;
const imgTrailingIcon = `${assetPathPrefix}/9f5cd.svg`;
const imgProgressIndicator = `${assetPathPrefix}/0ab03.svg`;
const imgNearLimitStatus = `${assetPathPrefix}/31d91.svg`;
const imgCategoryIcon = `${assetPathPrefix}/ff25b.svg`;
const imgProgressIndicator1 = `${assetPathPrefix}/12032.svg`;
const imgBudgetStatus = `${assetPathPrefix}/20f43.svg`;
const imgDivider = `${assetPathPrefix}/d3b47.svg`;
const imgCategoryIcon1 = `${assetPathPrefix}/5ee99.svg`;
const imgProgressIndicator2 = `${assetPathPrefix}/7b74e.svg`;
const imgCategoryIcon2 = `${assetPathPrefix}/d9c45.svg`;
const imgButtonIcon = `${assetPathPrefix}/102e7.svg`;
const imgDestinationIcon = `${assetPathPrefix}/ebd77.svg`;
const imgDestinationIcon1 = `${assetPathPrefix}/9e99e.svg`;
const imgDestinationIcon2 = `${assetPathPrefix}/6799f.svg`;
const imgDestinationIcon3 = `${assetPathPrefix}/e0588.svg`;
const imgDestinationIcon4 = `${assetPathPrefix}/21722.svg`;

export default function Component08Budgets() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:524" data-name="08 · Budgets">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:525" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:526" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:527" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:528" data-name="Signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:530" data-name="Wi-Fi">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFi} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:532" data-name="Battery">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:534" data-name="Screen content">
        <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:535" data-name="Top app bar">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:536" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
          <div className="relative shrink-0 size-[24px]" data-node-id="1:537" data-name="Trailing icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTrailingIcon} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[24px] pt-[8px] px-[16px] relative shrink-0 w-full" data-node-id="1:539" data-name="Page content">
          <div className="content-stretch flex h-[42px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:540" data-name="Segmented button">
            <div className="bg-[#eceae4] border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative rounded-bl-[100px] rounded-tl-[100px]" data-node-id="1:541" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:542" style={{ fontVariationSettings: '"wdth" 100' }}>
                October
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative rounded-br-[100px] rounded-tr-[100px]" data-node-id="1:543" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:544" style={{ fontVariationSettings: '"wdth" 100' }}>
                September
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:545" data-name="Budget summary card">
            <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 text-[#4a4843] text-[14px] w-full whitespace-nowrap" data-node-id="1:546" data-name="Budget summary">
              <p className="relative shrink-0" data-node-id="1:547" style={{ fontVariationSettings: '"wdth" 100' }}>
                October
              </p>
              <p className="relative shrink-0" data-node-id="1:548" style={{ fontVariationSettings: '"wdth" 100' }}>
                $2,462.05 of $3,200
              </p>
            </div>
            <div className="h-[10px] relative shrink-0 w-[326px]" data-node-id="1:549" data-name="Progress indicator">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgProgressIndicator} />
            </div>
            <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:594" data-name="Budget status">
              <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[14px] whitespace-nowrap" data-node-id="1:595" style={{ fontVariationSettings: '"wdth" 100' }}>
                $737.95 left
              </p>
              <div className="content-stretch flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="1:596" data-name="Status label">
                <div className="relative shrink-0 size-[16px]" data-node-id="1:597" data-name="Near limit status">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNearLimitStatus} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#5a6300] text-[13px] whitespace-nowrap" data-node-id="1:599" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Near limit
                </p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:600" data-name="Category budgets">
            <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:601" data-name="Section heading">
              <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] uppercase whitespace-nowrap" data-node-id="1:602" style={{ fontVariationSettings: '"wdth" 100' }}>
                Categories
              </p>
            </div>
            <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:603" data-name="Category card">
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:604" data-name="Budget category">
                <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="1:605" data-name="Category summary">
                  <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-node-id="1:606" data-name="Icon container">
                    <div className="overflow-clip relative shrink-0 size-[21px]" data-node-id="1:607" data-name="Category icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCategoryIcon} />
                    </div>
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:610" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Transportation
                  </p>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:611" style={{ fontVariationSettings: '"wdth" 100' }}>
                    $28.60 over
                  </p>
                </div>
                <div className="h-[10px] relative shrink-0 w-[326px]" data-node-id="1:612" data-name="Progress indicator">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgProgressIndicator1} />
                </div>
                <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:700" data-name="Category status">
                  <div className="content-stretch flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="1:701" data-name="Status label">
                    <div className="relative shrink-0 size-[16px]" data-node-id="1:702" data-name="Budget status">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBudgetStatus} />
                    </div>
                    <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#b3261e] text-[13px] whitespace-nowrap" data-node-id="1:704" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Over budget
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[13px] whitespace-nowrap" data-node-id="1:705" style={{ fontVariationSettings: '"wdth" 100' }}>
                    $148.60 of $120
                  </p>
                </div>
              </div>
              <div className="h-0 relative shrink-0 w-full" data-node-id="1:706" data-name="Divider">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:707" data-name="Budget category">
                <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="1:708" data-name="Category summary">
                  <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-node-id="1:709" data-name="Icon container">
                    <div className="overflow-clip relative shrink-0 size-[21px]" data-node-id="1:710" data-name="Category icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCategoryIcon1} />
                    </div>
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:713" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Food
                  </p>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:714" style={{ fontVariationSettings: '"wdth" 100' }}>
                    $87.82 left
                  </p>
                </div>
                <div className="h-[10px] relative shrink-0 w-[326px]" data-node-id="1:715" data-name="Progress indicator">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgProgressIndicator2} />
                </div>
                <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:760" data-name="Category status">
                  <div className="content-stretch flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="1:761" data-name="Status label">
                    <div className="relative shrink-0 size-[16px]" data-node-id="1:762" data-name="Budget status">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNearLimitStatus} />
                    </div>
                    <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#5a6300] text-[13px] whitespace-nowrap" data-node-id="1:764" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Near limit
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[13px] whitespace-nowrap" data-node-id="1:765" style={{ fontVariationSettings: '"wdth" 100' }}>
                    $362.18 of $450
                  </p>
                </div>
              </div>
              <div className="h-0 relative shrink-0 w-full" data-node-id="1:766" data-name="Divider">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgDivider} />
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:767" data-name="Budget category">
                <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="1:768" data-name="Category summary">
                  <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[40px]" data-node-id="1:769" data-name="Icon container">
                    <div className="relative shrink-0 size-[21px]" data-node-id="1:770" data-name="Category icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCategoryIcon2} />
                    </div>
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:772" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Bills
                  </p>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:773" style={{ fontVariationSettings: '"wdth" 100' }}>
                    $465.00 left
                  </p>
                </div>
                <div className="bg-[#eceae4] h-[10px] overflow-clip relative rounded-[100px] shrink-0 w-[326px]" data-node-id="1:774" data-name="Progress indicator">
                  <div className="absolute bg-[#1a1a1a] h-[10px] left-0 top-0 w-[198.9px]" data-node-id="1:775" data-name="Progress" />
                </div>
                <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 text-[#4a4843] text-[13px] w-full whitespace-nowrap" data-node-id="1:776" data-name="Category status">
                  <p className="relative shrink-0" data-node-id="1:777" style={{ fontVariationSettings: '"wdth" 100' }}>
                    On track
                  </p>
                  <p className="relative shrink-0" data-node-id="1:778" style={{ fontVariationSettings: '"wdth" 100' }}>
                    $735.00 of $1,200
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#1a1a1a] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[100px] shrink-0 w-full" data-node-id="1:779" data-name="Button">
            <div className="relative shrink-0 size-[18px]" data-node-id="1:780" data-name="Button icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgButtonIcon} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:782" style={{ fontVariationSettings: '"wdth" 100' }}>
              Add category
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t bottom-0 content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] right-0 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]" data-node-id="1:783" data-name="Navigation bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:783;24:1717" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:783;24:1718" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:783;24:1719" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:783;24:1721" style={{ fontVariationSettings: '"wdth" 100' }}>
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:783;24:1722" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:783;24:1723" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:783;24:1724" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:783;24:1726" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:783;24:1727" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:783;24:1728" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:783;24:1729" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:783;24:1731" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:783;24:1732" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:783;24:1733" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:783;24:1734" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:783;24:1736" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:783;24:1737" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:783;24:1738" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:783;24:1739" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon4} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:783;24:1741" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}