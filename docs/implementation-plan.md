Dựa trên các lựa chọn của bạn (NFT items + Three.js/React Three Fiber + Full demo), mình sẽ lên plan đầy đủ. Đây là plan đầy đủ cho game 3D thế giới mở onchain của bạn:

---

## Implementation Plan: Arc World — Open World 3D Game với NFT & USDC

### Summary
Game 3D thế giới mở chạy trên browser, dùng React Three Fiber. Người chơi điều khiển nhân vật đi lại trong thế giới 3D, kết nối ví, sở hữu vật phẩm dưới dạng NFT (ERC-721), mua bán vật phẩm bằng USDC trên marketplace onchain, và kiếm USDC từ việc hoàn thành nhiệm vụ.

### Architecture

- **Blockchain**: Arc Testnet — USDC là native gas token, phí giao dịch ổn định, finality dưới 1 giây, lý tưởng cho game economy
- **Contracts**:
  - `ArcWorldItem.sol` — ERC-721 NFT đại diện cho vật phẩm game (vũ khí, skin, pet)
  - `ArcWorldMarketplace.sol` — Marketplace: list/buy/cancel vật phẩm bằng USDC; thu phí 2.5%
  - `ArcWorldQuest.sol` — Quest system: owner tạo quest + lock USDC thưởng, người chơi hoàn thành để claim
- **Frontend**: React + Vite + React Three Fiber (3D scene) + drei (helpers) + wagmi + ConnectKit
- **Wallet**: ConnectKit — kết nối MetaMask/Coinbase Wallet, switch sang Arc Testnet tự động

### Files to Create/Modify

**Smart Contracts**
1. `contracts/ArcWorldItem.sol` — ERC-721 với mint, tokenURI, thuộc tính vật phẩm (type/rarity/power)
2. `contracts/ArcWorldMarketplace.sol` — List/buy/cancel vật phẩm; thanh toán USDC; event Listing/Sale
3. `contracts/ArcWorldQuest.sol` — Tạo quest với USDC reward, claim reward khi hoàn thành

**Frontend — Cấu hình & Provider**
4. `src/providers/Web3Provider.tsx` — WagmiProvider + ConnectKitProvider cấu hình Arc Testnet
5. `src/hooks/useContracts.ts` — Hooks tương tác với 3 contract (mint, list, buy, quest)

**Frontend — Game 3D**
6. `src/game/World.tsx` — React Three Fiber scene: terrain, ánh sáng, bầu trời, fog
7. `src/game/Player.tsx` — Nhân vật 3D điều khiển bằng WASD/arrow keys, camera follow
8. `src/game/QuestZone.tsx` — Vùng quest trong thế giới: bước vào để trigger hoàn thành quest
9. `src/game/ItemPickup.tsx` — Vật phẩm nổi trong thế giới, nhặt để mint NFT

**Frontend — UI/HUD**
10. `src/components/HUD.tsx` — Heads-up display: số dư USDC, tên nhân vật, minimap đơn giản
11. `src/components/Marketplace.tsx` — Modal marketplace: danh sách vật phẩm, mua/bán
12. `src/components/Inventory.tsx` — Túi đồ: hiển thị NFT đang sở hữu, cho phép list bán
13. `src/components/QuestBoard.tsx` — Bảng quest: danh sách nhiệm vụ active + USDC reward
14. `src/components/WalletBar.tsx` — Topbar: connect button, địa chỉ ví, số dư USDC

**Entry Point**
15. `src/App.tsx` — Layout chính: Web3Provider bọc toàn bộ, game canvas + UI overlay

### Build Sequence

1. **Viết & deploy 3 contracts** — ArcWorldItem (ERC-721), ArcWorldMarketplace (USDC payment), ArcWorldQuest (reward lock/claim) lên Arc Testnet. Security review balanced.
2. **Web3 setup** — Web3Provider với Arc Testnet config, hook useContracts kết nối ABI
3. **3D World** — React Three Fiber scene: terrain + ánh sáng + bầu trời + Player di chuyển WASD
4. **Game logic** — QuestZone trigger, ItemPickup mint NFT, collision detection cơ bản
5. **HUD & WalletBar** — Overlay UI: số dư, connect button, hiển thị trạng thái trong game
6. **Inventory & Marketplace UI** — Modal quản lý NFT, list/buy với USDC
7. **QuestBoard UI** — Bảng quest, hiển thị reward, nút claim sau khi hoàn thành
8. **Polish** — Lighting, animation vật phẩm nổi, loading states, error handling onchain

### Done When

- [ ] Người chơi di chuyển nhân vật trong thế giới 3D bằng WASD
- [ ] Kết nối MetaMask, tự động switch sang Arc Testnet
- [ ] Số dư USDC hiển thị trên HUD, cập nhật realtime
- [ ] Nhặt vật phẩm trong thế giới → mint thành NFT trên Arc
- [ ] Marketplace: list NFT để bán, người khác mua bằng USDC
- [ ] Quest: bước vào vùng quest → hoàn thành → claim USDC reward từ contract
- [ ] Tất cả giao dịch onchain trên Arc Testnet, xem được trên explorer

---

## Ready to build?

Approve plan này để bắt đầu build. Lưu ý: bạn cần chuẩn bị:
- **WalletConnect Project ID** miễn phí tại [cloud.walletconnect.com](https://cloud.walletconnect.com) — mình sẽ nhắc lại khi cần
- **Testnet USDC** tại [faucet.circle.com](https://faucet.circle.com) để test marketplace và quest Plan đã được lưu tại `arc-studio-plans/PLAN.md`.

Nhấn **Approve** để bắt đầu build, hoặc cho mình biết nếu muốn điều chỉnh gì — ví dụ thêm multiplayer, đổi style 3D (low-poly, pixel art), hoặc thay đổi cơ chế kiếm USDC.
