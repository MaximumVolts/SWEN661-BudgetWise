const assetPathPrefix = "/assets";
const imgSignal = `${assetPathPrefix}/fe9b0.svg`;
const imgWiFi = `${assetPathPrefix}/fda9d.svg`;
const imgBattery = `${assetPathPrefix}/96e48.svg`;
const imgLeadingIcon = `${assetPathPrefix}/6ec9b.svg`;
const imgTrailingIcon = `${assetPathPrefix}/9f5cd.svg`;
const imgShoppingBag = `${assetPathPrefix}/9e705.svg`;
const imgChipIcon = `${assetPathPrefix}/b7542.svg`;
const imgChipIcon1 = `${assetPathPrefix}/62fd7.svg`;
const imgChipIcon2 = `${assetPathPrefix}/3b5f2.svg`;
const imgChipIcon3 = `${assetPathPrefix}/92928.svg`;
const imgChipIcon4 = `${assetPathPrefix}/d23de.svg`;
const imgChipIcon5 = `${assetPathPrefix}/8ffd1.svg`;
const imgChipIcon6 = `${assetPathPrefix}/7255b.svg`;
const imgDivider = `${assetPathPrefix}/d3b47.svg`;
const imgButtonIcon = `${assetPathPrefix}/adf47.svg`;

export default function Component07TransactionDetail() {
  return (
    <div className="bg-[#fbfaf7] content-stretch flex flex-col items-start relative size-full" data-node-id="1:784" data-name="07 · Transaction Detail">
      <div className="content-stretch flex h-[28px] items-center justify-between overflow-clip px-[20px] relative shrink-0 w-full" data-node-id="1:785" data-name="Status bar">
        <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[12px] whitespace-nowrap" data-node-id="1:786" style={{ fontVariationSettings: '"wdth" 100' }}>
          9:41
        </p>
        <div className="content-stretch flex gap-[5px] items-center overflow-clip relative shrink-0" data-node-id="1:787" data-name="System status">
          <div className="relative shrink-0 size-[14px]" data-node-id="1:788" data-name="Signal">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
          </div>
          <div className="relative shrink-0 size-[14px]" data-node-id="1:790" data-name="Wi-Fi">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWiFi} />
          </div>
          <div className="relative shrink-0 size-[16px]" data-node-id="1:792" data-name="Battery">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="1:794" data-name="Screen content">
        <div className="content-stretch flex gap-[12px] h-[64px] items-center overflow-clip px-[16px] relative shrink-0 w-full" data-node-id="1:795" data-name="Top app bar">
          <div className="relative shrink-0 size-[24px]" data-node-id="1:796" data-name="Leading icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeadingIcon} />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Roboto:Medium'] font-medium leading-[normal] min-w-px relative text-[#1a1a1a] text-[20px]" data-node-id="1:798" style={{ fontVariationSettings: '"wdth" 100' }}>
            Transaction
          </p>
          <div className="relative shrink-0 size-[24px]" data-node-id="1:799" data-name="Trailing icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTrailingIcon} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip pb-[24px] pt-[8px] px-[16px] relative shrink-0 w-full" data-node-id="1:801" data-name="Page content">
          <div className="content-stretch flex flex-col gap-[8px] items-center overflow-clip py-[8px] relative shrink-0 w-full" data-node-id="1:802" data-name="Transaction amount">
            <div className="bg-[#f4f2ed] content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[56px]" data-node-id="1:803" data-name="Merchant icon">
              <div className="relative shrink-0 size-[28px]" data-node-id="1:804" data-name="Shopping bag">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgShoppingBag} />
              </div>
            </div>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[20px] whitespace-nowrap" data-node-id="1:806" style={{ fontVariationSettings: '"wdth" 100' }}>
              Greenmarket Grocery
            </p>
            <p className="[word-break:break-word] font-['Roboto:Medium'] font-medium leading-[normal] relative shrink-0 text-[#1a1a1a] text-[32px] whitespace-nowrap" data-node-id="1:807" style={{ fontVariationSettings: '"wdth" 100' }}>
              −$82.40
            </p>
            <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[14px] whitespace-nowrap" data-node-id="1:808" style={{ fontVariationSettings: '"wdth" 100' }}>
              October 13, 2026
            </p>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:809" data-name="Category card">
            <p className="[word-break:break-word] font-['Roboto:Regular'] font-normal leading-[normal] relative shrink-0 text-[#4a4843] text-[14px] whitespace-nowrap" data-node-id="1:810" style={{ fontVariationSettings: '"wdth" 100' }}>
              Category
            </p>
            <div className="content-start flex flex-wrap gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-node-id="1:811" data-name="Categories">
              <div className="bg-[#1a1a1a] border border-[#1a1a1a] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:812" data-name="Filter chip">
                <div className="overflow-clip relative shrink-0 size-[17px]" data-node-id="1:813" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:816" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Food
                </p>
              </div>
              <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:817" data-name="Filter chip">
                <div className="relative shrink-0 size-[17px]" data-node-id="1:818" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon1} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:820" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Bills
                </p>
              </div>
              <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:821" data-name="Filter chip">
                <div className="overflow-clip relative shrink-0 size-[17px]" data-node-id="1:822" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon2} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:825" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Transportation
                </p>
              </div>
              <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:826" data-name="Filter chip">
                <div className="relative shrink-0 size-[17px]" data-node-id="1:827" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon3} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:829" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Subscriptions
                </p>
              </div>
              <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:830" data-name="Filter chip">
                <div className="relative shrink-0 size-[17px]" data-node-id="1:831" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon4} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:833" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Utilities
                </p>
              </div>
              <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:834" data-name="Filter chip">
                <div className="relative shrink-0 size-[17px]" data-node-id="1:835" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon5} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:837" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Savings
                </p>
              </div>
              <div className="bg-white border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center overflow-clip px-[12px] relative rounded-[8px] shrink-0" data-node-id="1:838" data-name="Filter chip">
                <div className="relative shrink-0 size-[17px]" data-node-id="1:839" data-name="Chip icon">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChipIcon6} />
                </div>
                <p className="[word-break:break-word] font-['Roboto:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:841" style={{ fontVariationSettings: '"wdth" 100' }}>
                  New category
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cbc8c1] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative rounded-[20px] shrink-0 w-full" data-node-id="1:842" data-name="Details card">
            <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:843" data-name="Detail row">
              <p className="relative shrink-0 text-[#4a4843] text-[14px]" data-node-id="1:844" style={{ fontVariationSettings: '"wdth" 100' }}>
                Account
              </p>
              <p className="relative shrink-0 text-[#1a1a1a] text-[16px]" data-node-id="1:845" style={{ fontVariationSettings: '"wdth" 100' }}>
                Platypus Credit Card ••3333
              </p>
            </div>
            <div className="h-0 relative shrink-0 w-full" data-node-id="1:846" data-name="Divider">
              <div className="absolute inset-[-1px_0_0_0]">
                <img alt="" className="block max-w-none size-full" src={imgDivider} />
              </div>
            </div>
            <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:847" data-name="Detail row">
              <p className="relative shrink-0 text-[#4a4843] text-[14px]" data-node-id="1:848" style={{ fontVariationSettings: '"wdth" 100' }}>
                Status
              </p>
              <p className="relative shrink-0 text-[#1a1a1a] text-[16px]" data-node-id="1:849" style={{ fontVariationSettings: '"wdth" 100' }}>
                Posted Oct 18
              </p>
            </div>
            <div className="h-0 relative shrink-0 w-full" data-node-id="1:850" data-name="Divider">
              <div className="absolute inset-[-1px_0_0_0]">
                <img alt="" className="block max-w-none size-full" src={imgDivider} />
              </div>
            </div>
            <div className="[word-break:break-word] content-stretch flex font-['Roboto:Regular'] font-normal items-start justify-between leading-[normal] overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="1:851" data-name="Detail row">
              <p className="relative shrink-0 text-[#4a4843] text-[14px]" data-node-id="1:852" style={{ fontVariationSettings: '"wdth" 100' }}>
                Merchant
              </p>
              <p className="relative shrink-0 text-[#1a1a1a] text-[16px]" data-node-id="1:853" style={{ fontVariationSettings: '"wdth" 100' }}>
                GREENMARKET #042
              </p>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0)] border border-[#7a7872] border-solid content-stretch flex gap-[8px] h-[48px] items-center justify-center overflow-clip px-[20px] relative rounded-[100px] shrink-0 w-full" data-node-id="1:854" data-name="Button">
            <div className="relative shrink-0 size-[18px]" data-node-id="1:855" data-name="Button icon">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgButtonIcon} />
            </div>
            <p className="[word-break:break-word] font-['Roboto:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1a1a1a] text-[14px] whitespace-nowrap" data-node-id="1:857" style={{ fontVariationSettings: '"wdth" 100' }}>
              Add a note
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}