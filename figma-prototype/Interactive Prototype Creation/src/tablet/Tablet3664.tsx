const assetPathPrefix = "/tablet-assets";
const imgSignal = `${assetPathPrefix}/41589.svg`;
const imgWiFi = `${assetPathPrefix}/e7f71.svg`;
const imgBattery = `${assetPathPrefix}/e1cdb.svg`;
const imgLeadingIcon = `${assetPathPrefix}/dad39.svg`;
const imgHatch = `${assetPathPrefix}/e3dae.svg`;
const imgAlert = `${assetPathPrefix}/02b78.svg`;
const imgIcon = `${assetPathPrefix}/5eed4.svg`;
const imgDivider = `${assetPathPrefix}/29d88.svg`;
const imgIcon1 = `${assetPathPrefix}/2dda1.svg`;
const imgIcon2 = `${assetPathPrefix}/5a05e.svg`;
const imgDestinationIcon = `${assetPathPrefix}/ebd77.svg`;
const imgDestinationIcon1 = `${assetPathPrefix}/9e99e.svg`;
const imgDestinationIcon2 = `${assetPathPrefix}/6799f.svg`;
const imgDestinationIcon3 = `${assetPathPrefix}/e0588.svg`;
const imgDestinationIcon4 = `${assetPathPrefix}/21722.svg`;

export default function Component09BudgetDetail() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:3664" data-name="09 · Budget Detail">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:3665" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:3666" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:3667" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:3668" data-name="Signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:3670" data-name="Wi-Fi">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFi} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:3672" data-name="Battery">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px overflow-clip relative w-full" data-node-id="1:3674" data-name="Screen content">
        <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:3675" data-name="Top app bar">
          <div className="relative shrink-0 size-[24px]" data-node-id="1:3676" data-name="Leading icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeadingIcon} />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:3678" style={{ fontVariationSettings: '"wdth" 100' }}>
            Food
          </p>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:3679" style={{ fontVariationSettings: '"wdth" 100' }}>
            Edit
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] items-start min-h-px overflow-clip pb-[24px] pt-[8px] px-[16px] relative w-full" data-node-id="1:3680" data-name="Page content">
          <div className="bg-[#eceae4] border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:3681" data-name="Budget summary">
            <div className="[word-break:break-word] content-stretch flex items-end justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:3682" data-name="Budget amount">
              <div className="content-stretch flex flex-col gap-[3px] items-start overflow-clip relative shrink-0" data-node-id="1:3683" data-name="Spent">
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:3684" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Spent in October
                </p>
                <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[28px]" data-node-id="1:3685" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $362.18
                </p>
              </div>
              <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[14px]" data-node-id="1:3686" style={{ fontVariationSettings: '"wdth" 100' }}>
                of $450
              </p>
            </div>
            <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-full" data-node-id="1:3687" data-name="Progress indicator">
              <div className="absolute bg-[#5a6300] h-[10px] left-0 top-[-2px] w-[261px]" data-node-id="1:3688" data-name="Progress" />
              <div className="absolute flex items-center justify-center left-0 size-[9.899px] top-[-0.9px]" data-node-id="1:3689">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[8px] size-[9.899px] top-[-0.9px]" data-node-id="1:3690">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[16px] size-[9.899px] top-[-0.9px]" data-node-id="1:3691">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[24px] size-[9.899px] top-[-0.9px]" data-node-id="1:3692">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[32px] size-[9.899px] top-[-0.9px]" data-node-id="1:3693">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[40px] size-[9.899px] top-[-0.9px]" data-node-id="1:3694">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[48px] size-[9.899px] top-[-0.9px]" data-node-id="1:3695">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[56px] size-[9.899px] top-[-0.9px]" data-node-id="1:3696">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[64px] size-[9.899px] top-[-0.9px]" data-node-id="1:3697">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[72px] size-[9.899px] top-[-0.9px]" data-node-id="1:3698">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[80px] size-[9.899px] top-[-0.9px]" data-node-id="1:3699">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[88px] size-[9.899px] top-[-0.9px]" data-node-id="1:3700">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[96px] size-[9.899px] top-[-0.9px]" data-node-id="1:3701">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[104px] size-[9.899px] top-[-0.9px]" data-node-id="1:3702">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[112px] size-[9.899px] top-[-0.9px]" data-node-id="1:3703">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[120px] size-[9.899px] top-[-0.9px]" data-node-id="1:3704">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[128px] size-[9.899px] top-[-0.9px]" data-node-id="1:3705">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[136px] size-[9.899px] top-[-0.9px]" data-node-id="1:3706">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[144px] size-[9.899px] top-[-0.9px]" data-node-id="1:3707">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[152px] size-[9.899px] top-[-0.9px]" data-node-id="1:3708">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[160px] size-[9.899px] top-[-0.9px]" data-node-id="1:3709">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[168px] size-[9.899px] top-[-0.9px]" data-node-id="1:3710">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[176px] size-[9.899px] top-[-0.9px]" data-node-id="1:3711">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[184px] size-[9.899px] top-[-0.9px]" data-node-id="1:3712">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[192px] size-[9.899px] top-[-0.9px]" data-node-id="1:3713">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[200px] size-[9.899px] top-[-0.9px]" data-node-id="1:3714">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[208px] size-[9.899px] top-[-0.9px]" data-node-id="1:3715">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[216px] size-[9.899px] top-[-0.9px]" data-node-id="1:3716">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[224px] size-[9.899px] top-[-0.9px]" data-node-id="1:3717">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[232px] size-[9.899px] top-[-0.9px]" data-node-id="1:3718">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[240px] size-[9.899px] top-[-0.9px]" data-node-id="1:3719">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[248px] size-[9.899px] top-[-0.9px]" data-node-id="1:3720">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[256px] size-[9.899px] top-[-0.9px]" data-node-id="1:3721">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[264px] size-[9.899px] top-[-0.9px]" data-node-id="1:3722">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[272px] size-[9.899px] top-[-0.9px]" data-node-id="1:3723">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[280px] size-[9.899px] top-[-0.9px]" data-node-id="1:3724">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[288px] size-[9.899px] top-[-0.9px]" data-node-id="1:3725">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[296px] size-[9.899px] top-[-0.9px]" data-node-id="1:3726">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[304px] size-[9.899px] top-[-0.9px]" data-node-id="1:3727">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[312px] size-[9.899px] top-[-0.9px]" data-node-id="1:3728">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[320px] size-[9.899px] top-[-0.9px]" data-node-id="1:3729">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex items-center justify-center left-[328px] size-[9.899px] top-[-0.9px]" data-node-id="1:3730">
                <div className="-rotate-45 flex-none">
                  <div className="h-0 relative w-[14px]" data-name="Hatch">
                    <div className="absolute inset-[-2px_0_0_0]">
                      <img alt="" className="block max-w-none size-full" src={imgHatch} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:3731" data-name="Status">
              <div className="content-stretch flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="1:3732" data-name="Status label">
                <div className="relative shrink-0 size-[16px]" data-node-id="1:3733" data-name="Alert">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAlert} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#5a6300] text-[13px] whitespace-nowrap" data-node-id="1:3735" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Near limit
                </p>
              </div>
              <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:3736" style={{ fontVariationSettings: '"wdth" 100' }}>
                $87.82 left
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3737" data-name="Pace comparison">
            <p className="font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] uppercase w-full" data-node-id="1:3738" style={{ fontVariationSettings: '"wdth" 100' }}>
              Pace
            </p>
            <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[8px] items-start leading-[24px] overflow-clip p-[16px] relative rounded-[20px] shrink-0 text-[16px] w-full" data-node-id="1:3739" data-name="Pace insight">
              <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] w-full" data-node-id="1:3740" style={{ fontVariationSettings: '"wdth" 100' }}>{`You're spending $4.10 more per day than planned.`}</p>
              <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] w-full" data-node-id="1:3741" style={{ fontVariationSettings: '"wdth" 100' }}>{`At this pace, you'll be $42 over budget by October 31.`}</p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3742" data-name="Category transactions">
            <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] uppercase w-full" data-node-id="1:3743" style={{ fontVariationSettings: '"wdth" 100' }}>
              Recent transactions
            </p>
            <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[8px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:3744" data-name="Transactions">
              <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3745" data-name="Transaction">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3746" data-name="List item">
                  <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3747" data-name="Icon container">
                    <div className="relative shrink-0 size-[22px]" data-node-id="1:3748" data-name="Icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:3750" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:3751" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Greenmarket Grocery
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:3752" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Oct 13
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3753" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$82.40
                  </p>
                </div>
                <div className="h-0 relative shrink-0 w-full" data-node-id="1:3754" data-name="Divider">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <img alt="" className="block max-w-none size-full" src={imgDivider} />
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3755" data-name="Transaction">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3756" data-name="List item">
                  <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3757" data-name="Icon container">
                    <div className="relative shrink-0 size-[22px]" data-node-id="1:3758" data-name="Icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:3760" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:3761" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Harbor Cafe
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:3762" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Oct 11
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3763" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$28.50
                  </p>
                </div>
                <div className="h-0 relative shrink-0 w-full" data-node-id="1:3764" data-name="Divider">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <img alt="" className="block max-w-none size-full" src={imgDivider} />
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3765" data-name="Transaction">
                <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3766" data-name="List item">
                  <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3767" data-name="Icon container">
                    <div className="relative shrink-0 size-[22px]" data-node-id="1:3768" data-name="Icon">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon2} />
                    </div>
                  </div>
                  <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:3770" data-name="Text content">
                    <p className="font-['Roboto:Medium'] font-medium leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:3771" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Market Hall
                    </p>
                    <p className="font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:3772" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Oct 8
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3773" style={{ fontVariationSettings: '"wdth" 100' }}>
                    −$63.20
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t bottom-0 content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] right-0 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]" data-node-id="1:3774" data-name="Navigation bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3774;24:1717" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3774;24:1718" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3774;24:1719" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3774;24:1721" style={{ fontVariationSettings: '"wdth" 100' }}>
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3774;24:1722" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3774;24:1723" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3774;24:1724" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3774;24:1726" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3774;24:1727" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3774;24:1728" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3774;24:1729" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3774;24:1731" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3774;24:1732" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3774;24:1733" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3774;24:1734" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:3774;24:1736" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3774;24:1737" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3774;24:1738" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3774;24:1739" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon4} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3774;24:1741" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}