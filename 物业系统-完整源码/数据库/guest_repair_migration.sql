-- 允许未登录住户提交报修。已导入 hr.sql 的数据库执行一次即可。
ALTER TABLE repair_order
    MODIFY COLUMN user_id BIGINT NULL COMMENT '报修人ID（住户，免登录报修时为空）';
ALTER TABLE repair_order
    ADD COLUMN IF NOT EXISTS location VARCHAR(50) NULL COMMENT '报修位置';

INSERT INTO repair_category (category_name, description)
SELECT '水电', '水管、电路、灯具等维修'
WHERE NOT EXISTS (SELECT 1 FROM repair_category WHERE category_name = '水电');
INSERT INTO repair_category (category_name, description)
SELECT '门窗', '门、窗、锁具及五金维修'
WHERE NOT EXISTS (SELECT 1 FROM repair_category WHERE category_name = '门窗');
INSERT INTO repair_category (category_name, description)
SELECT '地面', '地面、墙面及相关设施维修'
WHERE NOT EXISTS (SELECT 1 FROM repair_category WHERE category_name = '地面');
INSERT INTO repair_category (category_name, description)
SELECT '家具', '桌椅、柜体等家具维修'
WHERE NOT EXISTS (SELECT 1 FROM repair_category WHERE category_name = '家具');
INSERT INTO repair_category (category_name, description)
SELECT '空调', '空调设备及通风设施维修'
WHERE NOT EXISTS (SELECT 1 FROM repair_category WHERE category_name = '空调');
INSERT INTO repair_category (category_name, description)
SELECT '其他', '其他物业维修事项'
WHERE NOT EXISTS (SELECT 1 FROM repair_category WHERE category_name = '其他');
