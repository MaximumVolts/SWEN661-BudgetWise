const assetPathPrefix = "/assets";
const imgIosSignal = `${assetPathPrefix}/84e7e.svg`;
const imgIosWifiSignal = `${assetPathPrefix}/0dc4f.svg`;
const imgIosBatteryFull = `${assetPathPrefix}/04c35.svg`;
const imgMoreVertical = `${assetPathPrefix}/e7dd8.svg`;
const imgCalendarSync = `${assetPathPrefix}/43bdb.svg`;
const imgLandmark = `${assetPathPrefix}/84790.svg`;
const imgCheckCircle = `${assetPathPrefix}/c43b1.svg`;
const imgPiggyBank = `${assetPathPrefix}/cccee.svg`;

export default function Component04Accounts() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:1203" data-name="04 · Accounts">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:1204" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:1205" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:1206" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:1207" data-name="ios-signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIosSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:1209" data-name="ios-wifi-signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIosWifiSignal} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:1211" data-name="ios-battery-full">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIosBatteryFull} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:1213" data-name="Top app bar">
        <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:1214" style={{ fontVariationSettings: '"wdth" 100' }}>
          Accounts
        </p>
        <div className="relative shrink-0 size-[24px]" data-node-id="1:1215" data-name="more-vertical">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMoreVertical} />
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-h-px overflow-clip pb-[24px] pt-[8px] px-[16px] relative w-full" data-node-id="1:1217" data-name="Page content">
        <div className="bg-[#f9dedc] content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative rounded-[12px] shrink-0 w-full" data-node-id="1:1218" data-name="Reconnect message">
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1219" data-name="Message content">
            <div className="relative shrink-0 size-[22px]" data-node-id="1:1220" data-name="calendar-sync">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCalendarSync} />
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative text-[16px]" data-node-id="1:1222" data-name="Message text">
              <p className="font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] w-full" data-node-id="1:1223" style={{ fontVariationSettings: '"wdth" 100' }}>
                Reconnect Tartan Bank
              </p>
              <p className="font-['Roboto:Regular'] font-normal leading-[24px] relative shrink-0 text-[#4a4843] w-full" data-node-id="1:1224" style={{ fontVariationSettings: '"wdth" 100' }}>
                Your connection has expired. Reconnect to keep your balances up to date.
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[8px] items-start justify-end overflow-clip relative shrink-0 w-full" data-node-id="1:1225" data-name="Message actions">
            <div className="content-stretch flex h-[40px] items-center justify-center overflow-clip px-[18px] relative shrink-0" data-node-id="1:1226" data-name="Not now">
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:1227" style={{ fontVariationSettings: '"wdth" 100' }}>
                Not now
              </p>
            </div>
            <div className="bg-[#1a1a1a] content-stretch flex h-[40px] items-center justify-center overflow-clip px-[24px] relative rounded-[100px] shrink-0" data-node-id="1:1228" data-name="Reconnect">
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:1229" style={{ fontVariationSettings: '"wdth" 100' }}>
                Reconnect
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[18px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1230" data-name="Checking and savings">
          <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:1231" data-name="Section heading">
            <p className="font-['Roboto:SemiBold'] font-semibold relative shrink-0 text-[#1a1a1a] text-[14px]" data-node-id="1:1232" style={{ fontVariationSettings: '"wdth" 100' }}>{`Checking & savings`}</p>
            <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[#4a4843] text-[13px]" data-node-id="1:1233" style={{ fontVariationSettings: '"wdth" 100' }}>
              Tartan Bank
            </p>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[20px] shrink-0 w-full" data-node-id="1:1234" data-name="Account card">
            <div className="content-stretch flex gap-[16px] items-start min-h-[102px] overflow-clip px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:1235" data-name="Account row">
              <div className="bg-[#eceae4] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:1236" data-name="Icon container">
                <div className="relative shrink-0 size-[22px]" data-node-id="1:1237" data-name="landmark">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLandmark} />
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:1239" data-name="Account details">
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:1240" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Everyday Checking
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:1241" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Checking •0000
                </p>
                <div className="content-stretch flex gap-[5px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1242" data-name="Connection status">
                  <div className="relative shrink-0 size-[16px]" data-node-id="1:1243" data-name="check-circle">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheckCircle} />
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:SemiBold'] font-semibold leading-[1.25] min-w-px relative text-[#1a1a1a] text-[12px]" data-node-id="1:1245" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Connected · synced 5 min ago
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] text-right w-[94px]" data-node-id="1:1246" style={{ fontVariationSettings: '"wdth" 100' }}>
                $3,248.60
              </p>
            </div>
            <div className="bg-[#cbc8c1] h-px relative shrink-0 w-full" data-node-id="1:1247" data-name="Divider" />
            <div className="content-stretch flex gap-[16px] items-start min-h-[102px] overflow-clip px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="1:1248" data-name="Account row">
              <div className="bg-[#eceae4] content-stretch flex items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[42px]" data-node-id="1:1249" data-name="Icon container">
                <div className="relative shrink-0 size-[22px]" data-node-id="1:1250" data-name="piggy-bank">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPiggyBank} />
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px overflow-clip relative" data-node-id="1:1252" data-name="Account details">
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[1.3] relative shrink-0 text-[#1a1a1a] text-[16px] w-full" data-node-id="1:1253" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Rainy Day Savings
                </p>
                <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[1.35] relative shrink-0 text-[#4a4843] text-[13px] w-full" data-node-id="1:1254" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Savings •1111
                </p>
                <div className="content-stretch flex gap-[5px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:1255" data-name="Connection status">
                  <div className="relative shrink-0 size-[16px]" data-node-id="1:1256" data-name="check-circle">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheckCircle} />
                  </div>
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:SemiBold'] font-semibold leading-[1.25] min-w-px relative text-[#1a1a1a] text-[12px]" data-node-id="1:1258" style={{ fontVariationSettings: '"wdth" 100' }}>
                    Connected · synced 5 min ago
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[16px] text-right w-[94px]" data-node-id="1:1259" style={{ fontVariationSettings: '"wdth" 100' }}>
                $6,120.00
              </p>
            </div>
          </div>
        </div>
        <div className="[word-break:break-word] bg-[rgba(255,255,255,0)] border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center leading-[normal] overflow-clip px-[20px] relative rounded-[100px] shrink-0 text-[#1a1a1a] w-full whitespace-nowrap" data-node-id="1:1260" data-name="Button">
          <p className="font-['Roboto:Regular'] font-normal relative shrink-0 text-[22px]" data-node-id="1:1261" style={{ fontVariationSettings: '"wdth" 100' }}>
            +
          </p>
          <p className="font-['Roboto:Bold'] font-bold relative shrink-0 text-[14px]" data-node-id="1:1262" style={{ fontVariationSettings: '"wdth" 100' }}>
            Link another account
          </p>
        </div>
      </div>
    </div>
  );
}