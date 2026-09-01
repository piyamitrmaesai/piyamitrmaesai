# P.C.R.C. Website — Netlify + Decap CMS

เว็บไซต์สมาคมปิยะมิตรแม่สายร่วมใจ บรรเทาสาธารณภัยและการกุศล เวอร์ชันสำหรับ Netlify โดยไม่ใช้ PHP

## ระบบที่มีให้
- เว็บไซต์หลายหน้า Responsive พร้อมเมนูบอกหน้าปัจจุบัน
- `/admin/` ใช้ Decap CMS สำหรับ ข่าวสาร, เอกสารดาวน์โหลด, ประกาศ, แกลเลอรี, แหล่งข้อมูล และข้อมูลติดต่อ/บริจาค
- ใช้ Editorial Workflow: บันทึกเป็น Draft / ส่งตรวจ / Publish ได้
- อัปโหลดรูปและเอกสารจากหน้า CMS
- หน้าแรกแสดงประกาศและ 3 ข่าวล่าสุดอัตโนมัติ
- `news.html` และ `downloads.html` อ่านข้อมูลที่ CMS เผยแพร่โดยอัตโนมัติ
- `/admin/import.html` ช่วยอ่านหัวข้อ/คำอธิบาย/ภาพ Open Graph จาก URL ภายนอก เพื่อใช้เป็นต้นร่าง (ต้องตรวจสอบก่อนเผยแพร่)

## สำคัญ: CMS บน Netlify ต้องเชื่อม Git Repository
การลาก ZIP ไปวางใน Netlify Drop ทำให้ “หน้าเว็บ” เปิดได้ แต่ CMS ไม่สามารถบันทึกข่าวกลับขึ้นเว็บไซต์ได้
หากต้องการใช้ `/admin/` เพื่อเพิ่มข่าวและเอกสาร ต้องนำโฟลเดอร์นี้ขึ้น GitHub หรือ GitLab แล้วให้ Netlify Deploy from Git

## วิธีติดตั้งแบบแนะนำ
1. สร้าง Repository ใหม่บน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ไปที่ root ของ Repository โดยให้ `netlify.toml` และ `package.json` อยู่ระดับบนสุด
3. ใน Netlify เลือก **Add new project / Import an existing project** แล้วเลือก Repository
4. Netlify จะอ่าน `netlify.toml` ให้เอง: Build command = `npm run build`, Publish directory = `dist`
5. Deploy ให้สำเร็จก่อนหนึ่งครั้ง
6. ใน Netlify ไปที่ **Project configuration → Identity** แล้วเปิด Netlify Identity
7. ตั้ง Registration เป็น **Invite only**
8. ไปที่ **Identity → Services → Git Gateway** แล้วเปิด Git Gateway
9. เชิญบัญชีผู้ดูแลเว็บไซต์ใน Identity
10. เข้า `https://ชื่อเว็บ.netlify.app/admin/` แล้ว Login

ตามเอกสาร Decap CMS/Netlify ระบบ Git Gateway ใช้ Netlify Identity เพื่อให้ผู้ใช้ CMS แก้ไฟล์ใน Git repository ได้ และ Netlify จะ Build เว็บไซต์ใหม่หลัง Publish

## การลงข่าว
1. เข้า `/admin/`
2. ข่าวสาร → New ข่าว
3. กรอกหัวข้อ วันที่ หมวด คำโปรย รายละเอียด และภาพ
4. Save เป็น Draft หรือ Publish
5. เมื่อ Publish แล้ว Git Gateway จะบันทึกลง Repository และ Netlify จะ Deploy ใหม่
6. ข่าวจะขึ้น `news.html` และข่าวล่าสุดขึ้นหน้าแรก

## การอัปโหลดเอกสาร
เข้า `/admin/` → เอกสารดาวน์โหลด → New เอกสาร → เลือกไฟล์ → Publish
ไฟล์จะถูกเก็บใน `assets/uploads/` และรายการขึ้นหน้า `downloads.html`

## การดึงข้อมูลจากแหล่งอื่น
เปิด `/admin/import.html` แล้ววาง URL ระบบ Netlify Function จะพยายามอ่าน Open Graph metadata เช่น ชื่อเรื่อง คำอธิบาย และภาพปก จากนั้นให้คัดลอกไปสร้างข่าว Draft ใน CMS

ข้อจำกัด: Facebook และบางเว็บไซต์อาจบล็อกการอ่านอัตโนมัติ ระบบจึงไม่รับประกันว่าดึงได้ทุกแหล่ง และไม่ได้ Publish เนื้อหาภายนอกอัตโนมัติ

## โครงสร้างสำคัญ
- `site/` หน้าเว็บต้นฉบับ
- `content/news/` ข่าวที่ CMS สร้าง
- `content/documents/` รายการเอกสาร
- `content/announcements/` ประกาศ
- `content/gallery/` แกลเลอรี
- `content/settings/site.json` ข้อมูลติดต่อ/บริจาค
- `admin/config.yml` ตั้งค่า CMS
- `assets/uploads/` ไฟล์ที่อัปโหลดผ่าน CMS
- `scripts/build.js` สร้างโฟลเดอร์ `dist/`
- `netlify/functions/import-url.js` ตัวช่วยอ่าน metadata จาก URL

## ทดสอบ Build ในเครื่อง
ต้องมี Node.js 20+

```bash
npm run build
```

ไฟล์พร้อมเผยแพร่จะอยู่ใน `dist/`
