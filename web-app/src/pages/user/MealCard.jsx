import { useEffect, useState } from 'react';
import { Check, ChevronDown, Pencil, Trash2, Utensils, X } from 'lucide-react';
import { formatCalories } from '../../utils/nutrition';
import { mealTitle } from './HomePage';

const mealEmoji = { breakfast: '☀️', lunch: '🥙', dinner: '🌙', snack: '🍓' };

function SafeImage({ src, fallback = <Utensils size={14} />, className = "" }) {
  const [hasError, setHasError] = useState(!src || src === '[object Object]' || String(src).includes('[object'));

  useEffect(() => {
    setHasError(!src || src === '[object Object]' || String(src).includes('[object'));
  }, [src]);

  if (hasError) return fallback;

  return (
    <img 
      src={src} 
      alt="" 
      className={className} 
      onError={() => setHasError(true)} 
    />
  );
}

export default function MealCard({
  type,
  meals = [],
  editingItem,
  savingItemId,
  setEditingItem,
  saveItemAmount,
  removeItem,
  setNotice
}) {
  const totalItems = meals.reduce((count, meal) => count + (meal.items?.length || 0), 0);
  const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.totals?.calories || 0), 0);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <article 
      className={`diary-meal card ${isOpen ? 'is-expanded' : ''}`}
      // Di chuột vào là tự động xổ ra
      onMouseEnter={() => setIsOpen(true)}
      // Rê chuột ra ngoài là tự thu gọn lại
      onMouseLeave={() => setIsOpen(false)}
      // Hỗ trợ chạm trên thiết bị di động
      onClick={() => setIsOpen((prev) => !prev)}
      style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
    >
      {/* Header Bữa Ăn */}
      <div className="diary-meal-head" style={{ userSelect: 'none' }}>
        <div className={`meal-icon ${type}`}>{mealEmoji[type]}</div>
        <div style={{ flex: 1 }}>
          <h3>{mealTitle(type)}</h3>
          <span>{totalItems > 0 ? `${totalItems} món` : 'Chưa ghi nhận'}</span>
        </div>
        <b className="meal-calories">
          {formatCalories(totalCalories)}
          <small> kcal</small>
        </b>
        {/* Biểu tượng Mũi tên xoay khi di chuột vào */}
        <div 
          className="accordion-toggle-icon"
          style={{
            marginLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.6
          }}
        >
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Nội dung danh sách món ăn - Hiển thị khi di chuột hoặc chạm */}
      {isOpen && (
        <div className="accordion-content">
          {meals.length === 0 || totalItems === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
              Chưa có món ăn nào trong bữa này.
            </div>
          ) : (
            meals.map((meal) => (
              <div className="meal-details" key={meal.id}>
                {meal.items?.map((item) => (
                  <div
                    className={`meal-detail-row ${editingItem?.id === item.id ? 'is-editing' : ''}`}
                    key={item.id}
                  >
                    <span className="meal-food-image">
                      <SafeImage src={item.image_url} fallback={<Utensils size={14} />} />
                    </span>

                    <span className="meal-detail-name">
                      {item.food_name}
                      {editingItem?.id === item.id ? (
                        <span className="inline-portion">
                          <input
                            aria-label={`Khẩu phần ${item.food_name}`}
                            autoFocus
                            type="number"
                            min="1"
                            max="9999.99"
                            step="1"
                            value={editingItem.amount}
                            onChange={(event) =>
                              setEditingItem({ ...editingItem, amount: event.target.value })
                            }
                          />
                          <span>g</span>
                        </span>
                      ) : (
                        <small>{item.amount_gram} g</small>
                      )}
                    </span>

                    <b>{formatCalories(item.calories)} kcal</b>

                    {editingItem?.id === item.id ? (
                      <>
                        <button
                          type="button"
                          className="icon-button save-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveItemAmount();
                          }}
                          disabled={savingItemId === item.id}
                          aria-label="Lưu khẩu phần"
                        >
                          {savingItemId === item.id ? <span className="loader" /> : <Check size={15} />}
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(null);
                          }}
                          aria-label="Hủy chỉnh sửa"
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotice('');
                            setEditingItem({ id: item.id, amount: item.amount_gram });
                          }}
                          aria-label={`Sửa khẩu phần ${item.food_name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button danger-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          aria-label={`Xóa ${item.food_name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
}