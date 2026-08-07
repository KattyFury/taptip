# Bước 5 — Setup môi trường: kết quả thật cho TapTip

Máy đã có sẵn từ trước (dùng chung máy với dự án ezwallet), nên không chạy prompt từ đầu — thay vào đó verify từng phần đã sẵn sàng chưa:

## Verify

| Việc | Kết quả |
|---|---|
| Node.js | `v22.16.0` — đã có |
| Git | `git version 2.49.0.windows.1` — đã có |
| Claude Code | `2.1.201 (Claude Code)` — đã có |
| GitHub account + repo | `KattyFury/build-on-arc`, đã clone và connect — đã có |
| Arc MCP server | Connected (`claude mcp list` → `claude.ai Arc Docs: https://docs.arc.io/mcp — ✔ Connected`) |
| Verify MCP hoạt động | Hỏi thử "USDC as gas token trên Arc" qua `search_arc_docs` → trả về đúng nội dung thật từ docs.arc.io (native gas token 18 decimals, ERC-20 interface 6 decimals, contract address...) |
| CLAUDE.md | Đã có sẵn, chi tiết hơn hẳn template gốc (`andrej-karpathy-skills`) — không cần ghi đè |
| MEMORY.md | Không tạo — trùng vai trò với `HANDOFF.md` đã có sẵn ở repo (trạng thái dự án, decisions log, việc tiếp theo) |

## Kết luận

Với máy đã build project khác trước đó, Bước 5 rút gọn còn: verify Arc MCP hoạt động + kiểm tra project đã có file trạng thái tương đương `MEMORY.md` chưa (ở đây là `HANDOFF.md`), không cần tạo trùng.
