const assetPathPrefix = "/tablet-assets";
const imgArrowLeft = `${assetPathPrefix}/ee71b.svg`;
const imgCheck = `${assetPathPrefix}/92cad.svg`;
const imgRadioFilled = `${assetPathPrefix}/a31da.svg`;
const imgDivider = `${assetPathPrefix}/8a4a8.svg`;
const imgCheck1 = `${assetPathPrefix}/b03f0.svg`;

export default function Component02OnboardingPriorities() {
  return (
    <div className="bg-[#fbfaf7] relative size-full" data-node-id="1:2197" data-name="02 · Onboarding Priorities">
      <div className="absolute content-stretch flex h-[56px] items-center justify-between left-0 px-[24px] top-0 w-[768px]" data-node-id="1:2198" data-name="top-bar">
        <div className="relative shrink-0 size-[24px]" data-node-id="1:2199" data-name="arrow-left">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
        </div>
        <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="1:2201" data-name="progress-steps">
          <div className="bg-[#1a1a1a] h-[4px] relative rounded-[2px] shrink-0 w-[180px]" data-node-id="1:2202" data-name="step1" />
          <div className="bg-[#cbc8c1] h-[4px] relative rounded-[2px] shrink-0 w-[180px]" data-node-id="1:2203" data-name="step2" />
          <div className="bg-[#cbc8c1] h-[4px] relative rounded-[2px] shrink-0 w-[180px]" data-node-id="1:2204" data-name="step3" />
        </div>
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:2205" style={{ fontVariationSettings: '"wdth" 100' }}>
          Skip
        </p>
      </div>
      <div className="absolute content-stretch flex flex-col items-start left-0 pb-[40px] px-[32px] top-[72px] w-[768px]" data-node-id="1:2206" data-name="content">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#4a4843] text-[11px] uppercase whitespace-nowrap" data-node-id="1:2207" style={{ fontVariationSettings: '"wdth" 100' }}>
          Step 1 of 3
        </p>
        <div className="h-[8px] relative shrink-0 w-full" data-node-id="1:2208" data-name="spacer-title" />
        <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[1.3] min-w-full relative shrink-0 text-[#1a1a1a] text-[28px] w-[min-content]" data-node-id="1:2209" style={{ fontVariationSettings: '"wdth" 100' }}>
          What should Pace help you with?
        </p>
        <div className="h-[8px] relative shrink-0 w-full" data-node-id="1:2210" data-name="spacer-sub" />
        <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[24px] min-w-full relative shrink-0 text-[#4a4843] text-[16px] w-[min-content]" data-node-id="1:2211" style={{ fontVariationSettings: '"wdth" 100' }}>
          Pick as many as you like. You can change these anytime in Settings.
        </p>
        <div className="h-[28px] relative shrink-0 w-full" data-node-id="1:2212" data-name="spacer-1" />
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2213" style={{ fontVariationSettings: '"wdth" 100' }}>
          Your priorities
        </p>
        <div className="h-[12px] relative shrink-0 w-full" data-node-id="1:2214" data-name="spacer-chips" />
        <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full" data-node-id="1:2215" data-name="chip-row-1">
          <div className="bg-[#eceae4] border border-[#1a1a1a] border-solid content-stretch flex gap-[6px] h-[48px] items-center pl-[12px] pr-[16px] py-[8px] relative rounded-[8px] shrink-0" data-node-id="1:2216" data-name="chip-money">
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2217" data-name="check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2219" style={{ fontVariationSettings: '"wdth" 100' }}>
              See where my money goes
            </p>
          </div>
          <div className="bg-[#eceae4] border border-[#1a1a1a] border-solid content-stretch flex gap-[6px] h-[48px] items-center pl-[12px] pr-[16px] py-[8px] relative rounded-[8px] shrink-0" data-node-id="1:2220" data-name="chip-bills">
            <div className="relative shrink-0 size-[16px]" data-node-id="1:2221" data-name="check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2223" style={{ fontVariationSettings: '"wdth" 100' }}>
              Stay on top of bills
            </p>
          </div>
          <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex h-[48px] items-center px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-node-id="1:2224" data-name="chip-budget">
            <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2225" style={{ fontVariationSettings: '"wdth" 100' }}>
              Stick to a budget
            </p>
          </div>
        </div>
        <div className="h-[8px] relative shrink-0 w-full" data-node-id="1:2226" data-name="spacer-chips-row2" />
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="1:2227" data-name="chip-row-2">
          <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex h-[48px] items-center px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-node-id="1:2228" data-name="chip-subscriptions">
            <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2229" style={{ fontVariationSettings: '"wdth" 100' }}>
              Track subscriptions
            </p>
          </div>
          <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex h-[48px] items-center px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-node-id="1:2230" data-name="chip-goal">
            <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2231" style={{ fontVariationSettings: '"wdth" 100' }}>
              Save for a goal
            </p>
          </div>
        </div>
        <div className="h-[28px] relative shrink-0 w-full" data-node-id="1:2232" data-name="spacer-2" />
        <div className="bg-[#fbfaf7] border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start relative rounded-[12px] shrink-0 w-full" data-node-id="1:2233" data-name="income-card">
          <div className="content-stretch flex h-[20px] items-center px-[16px] relative shrink-0 w-full" data-node-id="1:2234" data-name="income-header">
            <div className="content-stretch flex items-start px-[4px] relative shrink-0" data-node-id="1:2235" data-name="Frame">
              <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[12px] whitespace-nowrap" data-node-id="1:2236" style={{ fontVariationSettings: '"wdth" 100' }}>
                Your income
              </p>
            </div>
          </div>
          <div className="content-stretch flex items-start pb-[16px] pt-[8px] relative shrink-0 w-full" data-node-id="1:2237" data-name="radio-options">
            <div className="content-stretch flex gap-[12px] items-start px-[16px] py-[8px] relative shrink-0 w-[352px]" data-node-id="1:2238" data-name="option-steady">
              <div className="relative shrink-0 size-[20px]" data-node-id="1:2239" data-name="radio-filled">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRadioFilled} />
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="1:2241" data-name="option-steady-text">
                <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2242" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Steady paycheck
                </p>
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:2243" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Same amount on a regular schedule
                </p>
              </div>
            </div>
            <div className="h-0 relative shrink-0 w-px" data-node-id="1:2244" data-name="divider">
              <div className="absolute inset-[-1px_0_0_0]">
                <img alt="" className="block max-w-none size-full" src={imgDivider} />
              </div>
            </div>
            <div className="content-stretch flex gap-[12px] items-start px-[16px] py-[8px] relative shrink-0 w-[352px]" data-node-id="1:2245" data-name="option-variable">
              <div className="border-2 border-[#7a7872] border-solid relative rounded-[10px] shrink-0 size-[20px]" data-node-id="1:2246" data-name="radio-empty" />
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-node-id="1:2247" data-name="option-variable-text">
                <p className="font-['Roboto:Medium'] font-medium relative shrink-0 text-[#1a1a1a] text-[15px]" data-node-id="1:2248" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Changes month to month
                </p>
                <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:2249" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Freelance, tips or variable pay
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[28px] relative shrink-0 w-full" data-node-id="1:2250" data-name="spacer-3" />
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[13px] whitespace-nowrap" data-node-id="1:2251" style={{ fontVariationSettings: '"wdth" 100' }}>
          Budget period
        </p>
        <div className="h-[12px] relative shrink-0 w-full" data-node-id="1:2252" data-name="spacer-seg" />
        <div className="bg-[#fbfaf7] border border-[#7a7872] border-solid content-stretch flex h-[48px] items-start overflow-clip relative rounded-[24px] shrink-0 w-full" data-node-id="1:2253" data-name="segmented-control">
          <div className="bg-[#fbfaf7] content-stretch flex h-[48px] items-center justify-center relative shrink-0 w-[352px]" data-node-id="1:2254" data-name="seg-weekly">
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:2255" style={{ fontVariationSettings: '"wdth" 100' }}>
              Weekly
            </p>
          </div>
          <div className="bg-[#7a7872] h-[48px] relative shrink-0 w-px" data-node-id="1:2256" data-name="seg-divider" />
          <div className="bg-[#eceae4] content-stretch flex gap-[6px] h-[48px] items-center justify-center relative shrink-0 w-[352px]" data-node-id="1:2257" data-name="seg-monthly">
            <div className="relative shrink-0 size-[18px]" data-node-id="1:2258" data-name="check">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck1} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:2260" style={{ fontVariationSettings: '"wdth" 100' }}>
              Monthly
            </p>
          </div>
        </div>
        <div className="h-[28px] relative shrink-0 w-full" data-node-id="1:2261" data-name="spacer-4" />
        <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-node-id="1:2262" data-name="patterns-row">
          <div className="[word-break:break-word] content-stretch flex flex-col font-['Roboto:Regular'] font-normal gap-[4px] items-start leading-[normal] relative shrink-0 w-[560px]" data-node-id="1:2263" data-name="patterns-text">
            <p className="relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:2264" style={{ fontVariationSettings: '"wdth" 100' }}>
              Show patterns and icons on charts
            </p>
            <p className="relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:2265" style={{ fontVariationSettings: '"wdth" 100' }}>
              Helpful if colors are hard to tell apart
            </p>
          </div>
          <div className="bg-[#1a1a1a] content-stretch flex h-[32px] items-center justify-between px-[4px] relative rounded-[16px] shrink-0 w-[52px]" data-node-id="1:2266" data-name="toggle-on">
            <div className="h-px relative shrink-0 w-[4px]" data-node-id="1:2267" data-name="toggle-spacer" />
            <div className="bg-white relative rounded-[12px] shrink-0 size-[24px]" data-node-id="1:2268" data-name="thumb" />
          </div>
        </div>
        <div className="h-[48px] relative shrink-0 w-full" data-node-id="1:2269" data-name="spacer-5" />
        <div className="bg-[#1a1a1a] content-stretch flex h-[52px] items-center justify-center relative rounded-[26px] shrink-0 w-full" data-node-id="1:2270" data-name="continue-btn">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[15px] text-white whitespace-nowrap" data-node-id="1:2271" style={{ fontVariationSettings: '"wdth" 100' }}>
            Continue
          </p>
        </div>
      </div>
    </div>
  );
}
