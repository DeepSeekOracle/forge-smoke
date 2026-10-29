export const HUDStackSlots = (ctx, width, height) => {
  const slotWidth = 48;
  const slotHeight = 48;
  const padding = 16;

  // Health slot (top-left)
  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(10, 10, slotWidth, slotHeight);
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.fillText('HP', 15, 30);

  // Magic slot (top-right)
  ctx.fillStyle = '#4d4dff';
  ctx.fillRect(width - slotWidth - 10, 10, slotWidth, slotHeight);
  ctx.fillStyle = '#fff';
  ctx.fillText('MP', width - slotWidth - 10 + 10, 30);

  // Objective slot (bottom-left)
  ctx.fillStyle = '#ffcc4d';
  ctx.fillRect(10, height - slotHeight - 10, slotWidth, slotHeight);
  ctx.fillStyle = '#000';
  ctx.font = '10px Arial';
  ctx.fillText('OBJ', 15, height - slotHeight - 10 + 15);

  // Boss slot (bottom-right)
  ctx.fillStyle = '#4dff4d';
  ctx.fillRect(width - slotWidth - 10, height - slotHeight - 10, slotWidth, slotHeight);
  ctx.fillStyle = '#000';
  ctx.fillText('BOSS', width - slotWidth - 10 + 10, height - slotHeight - 10 + 15);
};