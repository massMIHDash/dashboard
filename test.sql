SELECT
    CONCAT(p.name_first, ' ', p.name_last) AS baker_name,
    CONCAT('Dear ', p.name_first, ', ') AS baker_first,
    CONCAT(h.primary_area, ' ', h.neighborhood) AS hub,
    f.title AS foodbank,
    CONCAT('Your Breadaversary: ', DATE_FORMAT(d.donation_date, '%m-%d-%Y')) AS donation_date,
    ROUND(IFNULL((SELECT SUM(d2.donation_qty)
     FROM wp_cl_donation d2
     WHERE d2.person_id = p.person_id
       AND d2.donation_item_id = 40005
       AND d2.donation_qty > 0
       AND d2.checked_in = 1
    ), 0)) AS total_loaves,
    ROUND(IFNULL((SELECT SUM(d3.donation_qty)
     FROM wp_cl_donation d3
     WHERE d3.person_id = p.person_id
       AND d3.donation_item_id IN (40032, 40034)
       AND d3.donation_qty > 0
       AND d3.checked_in = 1
    ), 0)) AS total_cookies,
    ROUND(IFNULL((SELECT SUM(d4.donation_qty)
     FROM wp_cl_donation d4
     WHERE d4.person_id = p.person_id
       AND d4.donation_item_id IN (40006, 40021, 40025, 40027, 40033, 40035, 40036)
       AND d4.donation_qty > 0
       AND d4.checked_in = 1
    ), 0)) AS total_special,
    ROUND(IFNULL((SELECT SUM(d2.donation_qty)
     FROM wp_cl_donation d2
     WHERE d2.person_id = p.person_id
       AND d2.donation_item_id = 40005
       AND d2.donation_qty > 0
       AND d2.checked_in = 1
       AND d2.donation_date BETWEEN DATE_SUB(DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR), INTERVAL 1 YEAR) AND DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR)
    ), 0)) AS total_loaves_2024,
    ROUND(IFNULL((SELECT SUM(d3.donation_qty)
     FROM wp_cl_donation d3
     WHERE d3.person_id = p.person_id
       AND d3.donation_item_id IN (40032, 40034)
       AND d3.donation_qty > 0
       AND d3.checked_in = 1
       AND d3.donation_date BETWEEN DATE_SUB(DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR), INTERVAL 1 YEAR) AND DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR)
    ), 0)) AS total_cookies_2024,
    ROUND(IFNULL((SELECT SUM(d4.donation_qty)
     FROM wp_cl_donation d4
     WHERE d4.person_id = p.person_id
       AND d4.donation_item_id IN (40006, 40021, 40025, 40027, 40033, 40035, 40036)
       AND d4.donation_qty > 0
       AND d4.checked_in = 1
       AND d4.donation_date BETWEEN DATE_SUB(DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR), INTERVAL 1 YEAR) AND DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR)
    ), 0)) AS total_special_2024,
    ROUND(IFNULL((SELECT SUM(d5.donation_qty)
     FROM wp_cl_donation d5
     WHERE d5.person_id = p.person_id
       AND d5.donation_item_id IN (40010, 40011, 40012, 40013, 40014, 40015, 40016, 40017, 40018, 40019, 40026, 40029, 40031, 40037, 40038)
       AND d5.donation_qty > 0
       AND d5.donation_date BETWEEN DATE_SUB(DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR), INTERVAL 1 YEAR) AND DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR)
    ), 0)) AS total_time_2024,
    (SELECT COUNT(*)
     FROM wp_cl_badge_person bp
     WHERE bp.person_id = p.person_id
    ) AS number_of_badges_earned,
    CONCAT(pl.name_first, ' ', pl.name_last) AS hub_leader_name,
    CONCAT(
        'Since your first donation on ',
        DATE_FORMAT(d.donation_date, '%m-%d-%Y'),
        ', you have donated ',
        ROUND(IFNULL((SELECT SUM(d2.donation_qty)
         FROM wp_cl_donation d2
         WHERE d2.person_id = p.person_id
           AND d2.donation_item_id = 40005
           AND d2.donation_qty > 0
           AND d2.checked_in = 1
        ), 0)),
        ' loaves, ',
        ROUND(IFNULL((SELECT SUM(d3.donation_qty)
         FROM wp_cl_donation d3
         WHERE d3.person_id = p.person_id
           AND d3.donation_item_id IN (40032, 40034)
           AND d3.donation_qty > 0
           AND d3.checked_in = 1
        ), 0)),
        ' energy cookies, and ',
        ROUND(IFNULL((SELECT SUM(d4.donation_qty)
         FROM wp_cl_donation d4
         WHERE d4.person_id = p.person_id
           AND d4.donation_item_id IN (40006, 40021, 40025, 40027, 40033, 40035, 40036)
           AND d4.donation_qty > 0
           AND d4.checked_in = 1
        ), 0)),
        ' special baked goods. You have earned ',
        (SELECT COUNT(*)
         FROM wp_cl_badge_person bp
         WHERE bp.person_id = p.person_id
        ),
        ' badges and are an invaluable contributor to our work.'
    ) AS paragraph_one,
    CONCAT(
        'Your doughnations to ',
        CONCAT(h.primary_area, ' ', h.neighborhood),
        ' and ',
        f.title,
        ' are helping to bake the world a better place.'
    ) AS paragraph_two,
    CASE anniversary.year
        WHEN 1 THEN 'first anniversary'
        WHEN 2 THEN 'second anniversary'
        WHEN 3 THEN 'third anniversary'
        WHEN 4 THEN 'fourth anniversary'
    END AS anniversary_year
FROM
    wp_cl_person p
JOIN
    wp_cl_donation d ON p.person_id = d.person_id
JOIN
    wp_cl_hub h ON p.hub_id = h.hub_id
JOIN
    wp_cl_food_pantry f ON h.food_pantry_id = f.food_pantry_id
LEFT JOIN
    wp_cl_hub_permissions hp ON h.hub_id = hp.hub_id AND hp.permission_level = 'owner' AND hp.deleted = 0
LEFT JOIN
    wp_cl_person pl ON hp.person_id = pl.person_id
JOIN (
    SELECT 1 AS year
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
) anniversary
WHERE
    d.donation_item_id IN (40005, 40032, 40034)
    AND d.donation_qty > 0
    AND d.checked_in = 1
    AND p.person_status = 'active'
    AND MONTH(DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR)) = 5
    AND YEAR(DATE_ADD(d.donation_date, INTERVAL anniversary.year YEAR)) = YEAR(CURDATE())
    AND d.donation_date = (
        SELECT MIN(d2.donation_date)
        FROM wp_cl_donation d2
        WHERE d2.person_id = d.person_id
        AND d2.donation_item_id IN (40005, 40032, 40034)
        AND d2.donation_qty > 0
        AND d2.checked_in = 1
    );