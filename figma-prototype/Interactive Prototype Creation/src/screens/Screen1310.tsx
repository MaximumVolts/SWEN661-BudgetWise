const assetPathPrefix = "/assets";
const imgIosSignal = `${assetPathPrefix}/84e7e.svg`;
const imgIosWifiSignal = `${assetPathPrefix}/0dc4f.svg`;
const imgIosBatteryFull = `${assetPathPrefix}/04c35.svg`;
const imgArrowLeft = `${assetPathPrefix}/5f2c2.svg`;
const imgCheck = `${assetPathPrefix}/33571.svg`;
const imgRadio = `${assetPathPrefix}/5e5eb.svg`;
const imgRadio1 = `${assetPathPrefix}/4b401.svg`;

export default function Component02OnboardingPriorities() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:1310" data-name="02 · Onboarding Priorities">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:1311" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:1312" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:1313" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:1314" data-name="ios-signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIosSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:1316" data-name="ios-wifi-signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIosWifiSignal} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:1318" data-name="ios-battery-full">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIosBatteryFull} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:1320" data-name="Top app bar">
        <div className="relative shrink-0 size-[24px]" data-node-id="1:1321" data-name="arrow-left">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
        </div>
        <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:1323" style={{ fontVariationSettings: '"wdth" 100' }}>
          What matters most?
        </p>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] items-start min-h-px overflow-clip pb-[24px] pl-[24px] pr-[16px] pt-[8px] relative w-full" data-node-id="1:1324" data-name="Page content">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1325" data-name="Intro">
          <p className="font-['Roboto:Medium'] font-medium leading-[1.15] relative shrink-0 text-[#1a1a1a] text-[28px] w-full" data-node-id="1:1326" style={{ fontVariationSettings: '"wdth" 100' }}>
            Set your priorities
          </p>
          <p className="font-['Roboto:Regular'] font-normal leading-[24px] relative shrink-0 text-[#4a4843] text-[16px] w-full" data-node-id="1:1327" style={{ fontVariationSettings: '"wdth" 100' }}>
            Choose what you want Pace to focus on first. You can change these later.
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1328" data-name="Priority choices">
          <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] w-full" data-node-id="1:1329" style={{ fontVariationSettings: '"wdth" 100' }}>
            What would you like help with?
          </p>
          <div className="content-start flex flex-wrap gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1330" data-name="Chips">
            <div className="bg-[#eceae4] border border-[#eceae4] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:1331" data-name="Choice chip">
              <div className="relative shrink-0 size-[16px]" data-node-id="1:1332" data-name="check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1334" style={{ fontVariationSettings: '"wdth" 100' }}>
                See where my money goes
              </p>
            </div>
            <div className="bg-[#eceae4] border border-[#eceae4] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:1335" data-name="Choice chip">
              <div className="relative shrink-0 size-[16px]" data-node-id="1:1336" data-name="check">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1338" style={{ fontVariationSettings: '"wdth" 100' }}>
                Stay on top of bills
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:1339" data-name="Choice chip">
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1340" style={{ fontVariationSettings: '"wdth" 100' }}>
                Stick to a budget
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:1341" data-name="Choice chip">
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1342" style={{ fontVariationSettings: '"wdth" 100' }}>
                Track subscriptions
              </p>
            </div>
            <div className="bg-white border border-[#7a7872] border-solid content-stretch flex h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:1343" data-name="Choice chip">
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1344" style={{ fontVariationSettings: '"wdth" 100' }}>
                Save for a goal
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[18px] h-[142px] items-start pb-[16px] pt-[24px] px-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:1345" data-name="Income choices">
          <div className="absolute bg-[#fbfaf7] content-stretch flex items-start left-[11px] overflow-clip px-[4px] top-[-11px]" data-node-id="1:1346" data-name="Legend">
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1347" style={{ fontVariationSettings: '"wdth" 100' }}>
              Your income
            </p>
          </div>
          <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="1:1348" data-name="Radio option">
            <div className="relative shrink-0 size-[22px]" data-node-id="1:1349" data-name="Radio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRadio} />
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Roboto:Regular'] font-normal gap-[2px] items-start min-w-px overflow-clip relative text-[16px]" data-node-id="1:1352" data-name="Option text">
              <p className="leading-[normal] relative shrink-0 text-[#1a1a1a] w-full" data-node-id="1:1353" style={{ fontVariationSettings: '"wdth" 100' }}>
                Steady paycheck
              </p>
              <p className="leading-[24px] relative shrink-0 text-[#4a4843] w-full" data-node-id="1:1354" style={{ fontVariationSettings: '"wdth" 100' }}>
                Same amount on a regular schedule
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0 w-full" data-node-id="1:1355" data-name="Radio option">
            <div className="relative shrink-0 size-[22px]" data-node-id="1:1356" data-name="Radio">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRadio1} />
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Roboto:Regular'] font-normal gap-[2px] items-start min-w-px overflow-clip relative text-[16px]" data-node-id="1:1358" data-name="Option text">
              <p className="leading-[normal] relative shrink-0 text-[#1a1a1a] w-full" data-node-id="1:1359" style={{ fontVariationSettings: '"wdth" 100' }}>
                Changes month to month
              </p>
              <p className="leading-[24px] relative shrink-0 text-[#4a4843] w-full" data-node-id="1:1360" style={{ fontVariationSettings: '"wdth" 100' }}>
                Freelance, tips or variable pay
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-end min-h-px overflow-clip relative w-full" data-node-id="1:1361" data-name="Action area">
          <div className="bg-[#1a1a1a] content-stretch flex h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[100px] shrink-0 w-full" data-node-id="1:1362" data-name="Button">
            <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:1363" style={{ fontVariationSettings: '"wdth" 100' }}>
              Continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}