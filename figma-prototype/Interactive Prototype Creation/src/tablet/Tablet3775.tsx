const assetPathPrefix = "/tablet-assets";
const imgSignal = `${assetPathPrefix}/41589.svg`;
const imgWiFi = `${assetPathPrefix}/e7f71.svg`;
const imgBattery = `${assetPathPrefix}/e1cdb.svg`;
const imgTrailingIcon = `${assetPathPrefix}/629c4.svg`;
const imgIcon = `${assetPathPrefix}/2dda1.svg`;
const imgRowSeparation = `${assetPathPrefix}/99621.svg`;
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
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:3775" data-name="10 · Spending & Trends">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:3776" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:3777" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:3778" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:3779" data-name="Signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:3781" data-name="Wi-Fi">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFi} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:3783" data-name="Battery">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px overflow-clip relative w-full" data-node-id="1:3785" data-name="Screen content">
        <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:3786" data-name="Top app bar">
          <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:3787" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
          <div className="relative shrink-0 size-[24px]" data-node-id="1:3788" data-name="Trailing icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTrailingIcon} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px overflow-clip pb-[24px] pt-[8px] px-[16px] relative w-full" data-node-id="1:3790" data-name="Page content">
          <div className="content-stretch flex h-[42px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3791" data-name="Segmented button">
            <div className="bg-[#eceae4] border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative rounded-bl-[100px] rounded-tl-[100px]" data-node-id="1:3792" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:3793" style={{ fontVariationSettings: '"wdth" 100' }}>
                Month
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative" data-node-id="1:3794" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:3795" style={{ fontVariationSettings: '"wdth" 100' }}>
                3 months
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex flex-[1_0_0] h-full items-center justify-center min-w-px overflow-clip relative rounded-br-[100px] rounded-tr-[100px]" data-node-id="1:3796" data-name="Segment">
              <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:3797" style={{ fontVariationSettings: '"wdth" 100' }}>
                Year
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:3798" data-name="Spending chart">
            <div className="[word-break:break-word] content-stretch flex items-end justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:3799" data-name="Spending summary">
              <div className="content-stretch flex flex-col gap-[3px] items-start overflow-clip relative shrink-0" data-node-id="1:3800" data-name="Total spent">
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:3801" style={{ fontVariationSettings: '"wdth" 100' }}>
                  October spending
                </p>
                <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[30px]" data-node-id="1:3802" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $1,083.42
                </p>
              </div>
              <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:3803" style={{ fontVariationSettings: '"wdth" 100' }}>
                ▲ 14.8%
              </p>
            </div>
            <div className="content-stretch flex h-[116px] items-end justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:3804" data-name="Bar chart">
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[54px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3805" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[78px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3806" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[45px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3807" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[92px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3808" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[70px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3809" data-name="Daily spend" />
              <div className="bg-[#e4ee6a] border-2 border-[#5a6300] border-dashed h-[104px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3810" data-name="Daily spend" />
              <div className="bg-[#eceae4] border border-[#7a7872] border-solid h-[84px] relative rounded-tl-[6px] rounded-tr-[6px] shrink-0 w-[28px]" data-node-id="1:3811" data-name="Daily spend" />
            </div>
            <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 text-[#4a4843] text-[11px] w-full whitespace-nowrap" data-node-id="1:3812" data-name="Chart labels">
              <p className="relative shrink-0" data-node-id="1:3813" style={{ fontVariationSettings: '"wdth" 100' }}>
                1
              </p>
              <p className="relative shrink-0" data-node-id="1:3814" style={{ fontVariationSettings: '"wdth" 100' }}>
                5
              </p>
              <p className="relative shrink-0" data-node-id="1:3815" style={{ fontVariationSettings: '"wdth" 100' }}>
                10
              </p>
              <p className="relative shrink-0" data-node-id="1:3816" style={{ fontVariationSettings: '"wdth" 100' }}>
                15
              </p>
              <p className="relative shrink-0" data-node-id="1:3817" style={{ fontVariationSettings: '"wdth" 100' }}>
                20
              </p>
              <p className="relative shrink-0" data-node-id="1:3818" style={{ fontVariationSettings: '"wdth" 100' }}>
                25
              </p>
              <p className="relative shrink-0" data-node-id="1:3819" style={{ fontVariationSettings: '"wdth" 100' }}>
                31
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:3820" data-name="Category breakdown">
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3821" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3822" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3823" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:3824" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:3826" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Food
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3827" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $362.18
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:3828" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 22.1%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:3829" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[46px]" data-node-id="1:3830" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:3831" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3833" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3834" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3835" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:3836" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:3838" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Savings
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3839" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $300.00
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:3840" style={{ fontVariationSettings: '"wdth" 100' }}>
                  No change
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:3841" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[38px]" data-node-id="1:3842" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:3843" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3845" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3846" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3847" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:3848" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon2} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:3850" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Transportation
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3851" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $148.60
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:3852" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 54.5%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:3853" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[19px]" data-node-id="1:3854" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:3855" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3857" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3858" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3859" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:3860" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon3} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:3862" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Utilities
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3863" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $84.30
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:3864" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 17.2%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:3865" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[12px]" data-node-id="1:3866" data-name="Progress" />
              </div>
              <div className="h-[16px] relative shrink-0 w-full" data-node-id="1:3867" data-name="Row separation">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRowSeparation} />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:3869" data-name="Spending category">
              <div className="content-stretch flex gap-[16px] items-center min-h-[68px] overflow-clip py-[10px] relative shrink-0 w-full" data-node-id="1:3870" data-name="List item">
                <div className="bg-[#f4f2ed] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:3871" data-name="Icon container">
                  <div className="relative shrink-0 size-[22px]" data-node-id="1:3872" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon4} />
                  </div>
                </div>
                <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[1.3] min-w-px relative text-[#1a1a1a] text-[16px]" data-node-id="1:3874" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Subscriptions
                </p>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[15px] text-right whitespace-nowrap" data-node-id="1:3875" style={{ fontVariationSettings: '"wdth" 100' }}>
                  $31.97
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] text-right w-[68px]" data-node-id="1:3876" style={{ fontVariationSettings: '"wdth" 100' }}>
                  ▲ 89.2%
                </p>
              </div>
              <div className="bg-[#eceae4] content-stretch flex h-[10px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[64px]" data-node-id="1:3877" data-name="Progress indicator">
                <div className="bg-[#1a1a1a] h-[10px] relative shrink-0 w-[12px]" data-node-id="1:3878" data-name="Progress" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#f2f0ea] border-[#cbc8c1] border-solid border-t bottom-0 content-stretch flex h-[80px] items-center left-0 overflow-clip p-[8px] right-0 shadow-[0px_-2px_8px_0px_rgba(0,0,0,0.08)]" data-node-id="1:3879" data-name="Navigation bar">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3879;24:1691" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3879;24:1692" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3879;24:1693" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3879;24:1695" style={{ fontVariationSettings: '"wdth" 100' }}>
            Home
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3879;24:1696" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3879;24:1697" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3879;24:1698" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon1} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3879;24:1700" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transactions
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3879;24:1701" data-name="Navigation destination">
          <div className="bg-[#2b2e00] content-stretch flex h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3879;24:1702" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3879;24:1703" data-name="Icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon5} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] min-w-full relative shrink-0 text-[#1a1a1a] text-[10px] text-center w-[min-content]" data-node-id="I1:3879;24:1705" style={{ fontVariationSettings: '"wdth" 100' }}>
            Spending
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3879;24:1706" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3879;24:1707" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3879;24:1708" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon2} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3879;24:1710" style={{ fontVariationSettings: '"wdth" 100' }}>
            Budgets
          </p>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[3px] h-[64px] items-center justify-center min-w-px overflow-clip relative" data-node-id="I1:3879;24:1711" data-name="Navigation destination">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[32px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 w-[60px]" data-node-id="I1:3879;24:1712" data-name="Active indicator">
            <div className="relative shrink-0 size-[22px]" data-node-id="I1:3879;24:1713" data-name="Destination icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDestinationIcon3} />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] min-w-full relative shrink-0 text-[#4a4843] text-[10px] text-center w-[min-content]" data-node-id="I1:3879;24:1715" style={{ fontVariationSettings: '"wdth" 100' }}>
            Bills
          </p>
        </div>
      </div>
    </div>
  );
}